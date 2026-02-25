# VeWorld Mobile

## Architecture

### VechainWalletKit (`src/VechainWalletKit/`)

This folder is an **external library** that will be extracted to a standalone npm package. It MUST NOT import from any VeWorld application code. Specifically:

- No imports using `~` path aliases (`~Storage`, `~Model`, `~Components`, `~Hooks`, `~Utils`, `~Constants`, `~Navigation`, `~Screens`, `~Assets`, `~Api`, `~i18n`)
- Only relative imports within `src/VechainWalletKit/` and external npm packages are allowed
- The code inside can be modified, but it must remain usable as a standalone library
- VeWorld app code should consume VechainWalletKit through its public exports (`src/VechainWalletKit/index.ts`)
- Any integration between VechainWalletKit and VeWorld (e.g. syncing state to Redux) belongs in VeWorld wrapper components such as `src/Components/Providers/FeatureFlaggedSmartWallet.tsx`
