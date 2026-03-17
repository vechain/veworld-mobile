# Native Token Swap Feature — Implementation Plan

## Context

VeWorld currently routes swap users to external DEX dApps via an in-app browser. This plan replaces that with a **native in-wallet swap experience** — querying VeChain DEXes directly, showing the best price, and taking a 0.75% platform fee. This is the same model MetaMask uses on Ethereum (they charge 0.875%).

The goal is to ship a v1 on VeChain with the simplest possible architecture (no backend, no smart contract), then expand to Ethereum later using the 0x Swap API with a thin credential proxy.

## Architecture Decisions

- **New screen, feature flagged** — create a new `NativeSwapScreen` alongside the existing `SwapScreen` (dApp list). Toggle between them via `nativeSwapFeature.enabled` feature flag. Existing SwapScreen stays untouched.
- **No backend** — client queries DEX routers directly (read-only `getAmountsOut` calls)
- **No Fee Router contract** — use VeChain multi-clause transactions (fee transfer + approve + swap in one atomic tx)
- **Config-driven DEX registry** — all VeChain DEXes are Uniswap V2 forks, same ABI, just different router/factory addresses
- **Fee on input token** (0.75%) — simpler than output since amount is known before swap executes
- **Mixpanel** for swap analytics (volume, pairs, revenue tracking)
- **Ethereum later** — 0x Swap API with `swapFeeBps=75` + thin serverless proxy for API key

### Why No Backend?

With only 2 DEXes on VeChain (both Uniswap V2 forks), client-side aggregation is trivial — query `getAmountsOut` on each router in parallel, pick the best quote. VeChain's `thor.explain()` can batch all read calls into a single RPC request. Even at 10 DEXes this approach scales fine. A backend only becomes worthwhile when adding Ethereum (via 0x API which requires an API key that can't be embedded in the app).

### Why No Fee Router Contract?

VeChain's multi-clause transactions achieve the same result — fee transfer + swap execute atomically in one tx. A Fee Router contract would enforce the fee on-chain, but users can always bypass it by going to DEX websites directly. The fee is the price of convenience (best price aggregation, native UX). MetaMask uses the same client-enforced fee model. A contract can be added later if needed.

### Why Fee on Input Token?

The fee amount is deterministic before the swap executes (`amountIn * 0.75%`). Taking fee on output would require estimating the output first, then adjusting — more complex, and the user would see a different number than what they entered.

## Implementation Details

### 1. DEX Config

**New file: `src/Constants/Constants/Swap/SwapConstants.ts`**

Config-driven registry for all supported DEXes. Adding a new DEX = adding an object to the array.

```typescript
type DexConfig = {
  id: string
  name: string
  routerAddress: string
  factoryAddress: string
  wvetAddress: string
  usesVETMethods: boolean  // true: swapExactVETForTokens, false: swapExactETHForTokens
}

type SwapConfig = {
  dexes: DexConfig[]
  feeCollectorAddress: string       // Treasury/multisig address
  feeBasisPoints: number             // 75 = 0.75%
  defaultSlippageBasisPoints: number // 50 = 0.5%
}

// Keyed by NETWORK_TYPE.MAIN | NETWORK_TYPE.TEST
const SWAP_CONFIG: Record<NetworkType, SwapConfig> = {
  [NETWORK_TYPE.MAIN]: {
    dexes: [
      { id: 'betterswap', name: 'BetterSwap', routerAddress: '0x...', ... },
      { id: 'vetrade', name: 'VeTrade', routerAddress: '0x...', ... },
    ],
    feeCollectorAddress: '0x...',
    feeBasisPoints: 75,
    defaultSlippageBasisPoints: 50,
  },
  ...
}
```

Also export from `src/Constants/Constants/index.ts`.

The `usesVETMethods` flag handles the fact that some VeChain DEXes renamed Uniswap's ETH methods to VET (e.g., `swapExactVETForTokens`) while others kept the original names (`swapExactETHForTokens`). The existing codebase has both ABI sets: `RouterV2VET.abi.ts` and `UniswapRouterV2.abi.ts`.

### 2. Factory ABI

**New file: `src/Constants/Constants/Thor/abis/UniswapV2Factory.abi.ts`**

Add `getPair(tokenA, tokenB)` function definition. Used to check if a trading pair exists on a DEX before attempting to quote. Source ABI available at `abi-resources/abis/uniswap-v2-factory.json`.

### 3. Swap Hooks

**New directory: `src/Hooks/useSwap/`**

#### `useSwapQuote.ts` — Core quoting hook

- Queries `getAmountsOut(amountAfterFee, path)` on all DEX routers in parallel
- Checks pair existence first via `getPair()` on each factory (skip DEXes without the pair)
- Maps VET (address `0x0`) to each DEX's `wvetAddress` in the token path
- Computes fee: `amountIn * feeBasisPoints / 10000` using BigNumber
- Returns best quote (highest `amountOut`) with full breakdown:
  - `dexId`, `dexName`, `amountIn`, `feeAmount`, `amountInAfterFee`, `amountOut`, `amountOutMin` (with slippage), `priceImpact`, `path`
- Uses `@tanstack/react-query` with ~15s stale time
- Only fires when debounced amount is non-zero (500ms debounce)

#### `useSwapClauses.ts` — Multi-clause transaction builder

Follows the exact pattern from `useConvertBetterTokens` (`src/Hooks/useConvertBetterTokens/useConvertBetterTokens.ts`): uses `thor-devkit` `abi.Function.encode()` to build clause data.

**Three swap scenarios:**

**Token → Token:**
```
Clause 1: approve(routerAddress, amountAfterFee) on input token contract
Clause 2: transfer(feeCollector, feeAmount) on input token contract
Clause 3: swapExactTokensForTokens(amountAfterFee, amountOutMin, path, userAddress, deadline) on DEX router
```

**VET → Token:**
```
Clause 1: native VET transfer to feeCollector (value: feeAmount, data: "0x")
Clause 2: swapExactVETForTokens(amountOutMin, path, userAddress, deadline) on DEX router (value: amountAfterFee)
```
No approve needed — VET swap methods are payable.

**Token → VET:**
```
Clause 1: approve(routerAddress, amountAfterFee) on input token contract
Clause 2: transfer(feeCollector, feeAmount) on input token contract
Clause 3: swapExactTokensForVET(amountAfterFee, amountOutMin, path, userAddress, deadline) on DEX router
```

Deadline: current block timestamp + 1200 seconds (20 minutes).

#### `useSwapTokens.ts` — Token list for swap selection

Reuses existing Redux selectors: `selectOfficialTokens`, `selectCustomTokens` from `src/Storage/Redux/Selectors/Tokens.ts`.

#### `useTokenAllowance.ts` — Check existing approval

Queries `allowance(owner, spender)` on the input token. If the user already has sufficient allowance for the router, the approve clause can be skipped (saves gas).

### 4. Feature Flag

**`src/Api/FeatureFlags/endpoint.ts`**: Add to `FeatureFlags` type:
```typescript
nativeSwapFeature: { enabled: boolean }
```

**`src/Components/Providers/FeatureFlagsProvider.tsx`**: Add default to `initialState`:
```typescript
nativeSwapFeature: { enabled: false }
```

### 5. Swap UI — New Screen (existing SwapScreen untouched)

#### `src/Screens/Flows/App/NativeSwapScreen/NativeSwapScreen.tsx` — NEW

New native swap form (the existing `SwapScreen` with its dApp list remains untouched as fallback):

- **Header**: "Swap" title + account selector pill (reuse existing `ChangeAccountButtonPill`)
- **From section**: Token selector button (icon + symbol + balance) + amount input + MAX button
- **Swap toggle**: Arrow button to flip from/to tokens
- **To section**: Token selector button + read-only output amount (from quote)
- **Quote details panel**: Selected DEX name, exchange rate, fee breakdown (0.75% = X tokens), minimum received, price impact
- **Slippage button**: Shows current setting, opens bottom sheet
- **Swap button**: Disabled until valid quote + sufficient balance + sufficient VTHO for gas

On "Swap" press → navigate to `NativeSwapConfirmationScreen` with quote params.

#### `src/Screens/Flows/App/NativeSwapScreen/NativeSwapConfirmationScreen.tsx` — NEW

Follows the pattern of `TransactionSummarySendScreen` (`src/Screens/Flows/App/SendScreen/04-TransactionSummarySendScreen/`):

1. Build clauses via `useSwapClauses`
2. Feed into `useTransactionScreen` (`src/Hooks/useTransactionScreen/useTransactionScreen.tsx`) — handles gas estimation, fee delegation, signing, and sending
3. Display: review card (amounts, fee, DEX), gas fee speed selector, confirm button
4. On success: navigate home, track Mixpanel event

#### New sub-components (`src/Screens/Flows/App/NativeSwapScreen/components/`):

- `SwapTokenSelector.tsx` — token button + amount input combo
- `SwapQuoteDisplay.tsx` — rate, fee, price impact breakdown
- `SwapSlippageSettings.tsx` — bottom sheet with presets (0.5%, 1%, 2%) + custom input
- `SwapTokenSelectionBottomSheet.tsx` — token picker (modeled on `src/Components/Reusable/Send/01-Amount/Components/TokenSelectionBottomSheet.tsx`)

### 6. Navigation

**`src/Navigation/Enums.ts`**: Add `NATIVE_SWAP = "Native_Swap"`, `NATIVE_SWAP_CONFIRMATION = "Native_Swap_Confirmation"`

**`src/Navigation/Stacks/HomeStack.tsx`**:
- Add `Routes.NATIVE_SWAP` and `Routes.NATIVE_SWAP_CONFIRMATION` screen entries
- Use feature flag to conditionally render the swap route (same pattern as `OnboardingStack` which toggles `WelcomeScreenV2` vs `WelcomeScreen`):

```typescript
const { nativeSwapFeature } = useFeatureFlags()

<Home.Screen
    name={Routes.SWAP}
    component={nativeSwapFeature.enabled ? NativeSwapScreen : SwapScreen}
/>
```

This keeps the existing `Routes.SWAP` navigation path so all entry points (tab bar, deep links) work unchanged — only the rendered component switches based on the flag.

### 7. Analytics (Mixpanel)

**`src/Constants/Enums/AnalyticsEvent.ts`**: Add events:

| Event | Properties |
|-------|-----------|
| `SWAP_QUOTE_REQUESTED` | fromToken, toToken, amountIn, dexCount |
| `SWAP_SUBMITTED` | fromToken, toToken, amountIn, amountOut, dexId, feeAmount, slippage |
| `SWAP_SUCCESS` | fromToken, toToken, amountIn, amountOut, dexId, feeAmount, txId |
| `SWAP_FAILED` | fromToken, toToken, amountIn, dexId, error |
| `SWAP_SLIPPAGE_CHANGED` | slippageBasisPoints |

### 8. Translation Keys

**`src/i18n/translations/en.json`**: Add keys for swap labels, fee display, slippage settings, error messages, confirmation screen.

Then run `yarn i18n:types` to regenerate types.

## Key Existing Code to Reuse

| What | File | Reuse for |
|------|------|-----------|
| Multi-clause pattern | `src/Hooks/useConvertBetterTokens/useConvertBetterTokens.ts` | `abi.Function.encode()` + clause array construction |
| Transaction flow | `src/Hooks/useTransactionScreen/useTransactionScreen.tsx` | Gas estimation, delegation, signing, sending |
| DEX router ABIs | `src/Constants/Constants/Thor/abis/RouterV2VET.abi.ts` | `getAmountsOut`, `swapExactTokensForTokens`, `swapExactVETForTokens`, etc. |
| Token picker UI | `src/Components/Reusable/Send/01-Amount/Components/TokenSelectionBottomSheet.tsx` | Bottom sheet token selection pattern |
| Confirmation screen | `src/Screens/Flows/App/SendScreen/04-TransactionSummarySendScreen/` | Layout and flow pattern |
| Token selectors | `src/Storage/Redux/Selectors/Tokens.ts` | `selectOfficialTokens`, `selectCustomTokens` |

## Implementation Order

### Phase 1: Foundation
- Feature flag (`nativeSwapFeature`) — type, default, remote flag config
- DEX config file (`SwapConstants.ts`)
- Factory ABI (`UniswapV2Factory.abi.ts`)
- Analytics events
- Translation keys + `yarn i18n:types`
- Navigation routes (`NATIVE_SWAP`, `NATIVE_SWAP_CONFIRMATION`) + feature flag toggle in HomeStack

### Phase 2: Core Logic
- `useSwapQuote` — quoting across DEXes
- `useSwapClauses` — multi-clause transaction building
- `useSwapTokens` — token list
- `useTokenAllowance` — allowance checking

### Phase 3: UI
- `NativeSwapScreen` (new screen)
- `NativeSwapConfirmationScreen`
- Sub-components (token selector, quote display, slippage settings, token picker)

### Phase 4: Polish
- Error handling (network errors, reverted calls, stale quotes)
- Edge cases (zero amount, same token selected, no liquidity, high price impact warning)
- Testing

## Verification

1. Run `yarn i18n:types` after adding translation keys
2. Unit test clause building (correct ABI encoding, fee math, all 3 swap scenarios)
3. Test on VeChain testnet with a testnet DEX
4. Verify multi-clause transaction executes atomically (fee + swap succeed or both revert)
5. Verify Mixpanel events fire with correct properties
6. Test edge cases: insufficient balance, no liquidity, high slippage, VET↔token and token↔token

## Future Expansion (Not in Scope)

- **Ethereum support**: 0x Swap API (`swapFeeBps=75` + `swapFeeRecipient`) with thin serverless proxy (AWS Lambda / Cloudflare Worker) for API key injection. Same swap UI, different quote source and tx builder.
- **Fee Router contract**: On-chain fee enforcement if tamper-proofing becomes important
- **Multi-hop routing**: A→B→C paths when direct pairs don't exist
- **Split routing**: Splitting volume across DEXes for large trades
- **Remote DEX config**: Firebase Remote Config or similar to add DEXes without app updates
