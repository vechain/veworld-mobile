# VechainWalletKit

A modular, provider-agnostic wallet SDK for VeChain applications with smart account support and transaction building capabilities.

## 🏗️ Architecture

VechainWalletKit uses an adapter pattern to abstract away specific wallet providers (like Privy) from your application logic. This makes it easy to switch providers or create custom implementations.

```
┌─────────────────────────────────────────────────────────┐
│                    Your App                             │
├─────────────────────────────────────────────────────────┤
│              VechainWalletProvider                      │
│                (Provider Agnostic)                      │
├─────────────────────────────────────────────────────────┤
│                 WalletAdapter                           │
│                   (Interface)                           │
├─────────────────────────────────────────────────────────┤
│    PrivyAdapter    │    CustomAdapter    │    ...       │
│   (Privy Impl)     │   (Your Impl)       │              │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Using with Privy (Recommended for most users)

```tsx
import React from 'react'
import { VechainWalletWithPrivy, VechainWalletSDKConfig } from '@/VechainWalletKit'

const config: VechainWalletSDKConfig = {
  networkConfig: {
    nodeUrl: 'https://testnet.vechain.org',
    networkType: 'testnet', // or 'mainnet'
  },
  providerConfig: {
    appId: 'your-privy-app-id',
    clientId: 'your-privy-client-id',
  },
}

function App() {
  return (
    <VechainWalletWithPrivy config={config}>
      <YourAppContent />
    </VechainWalletWithPrivy>
  )
}
```

### Option 2: Using with Custom Adapter

```tsx
import React from 'react'
import { 
  VechainWalletProvider, 
  usePrivyAdapter, 
  VechainWalletSDKConfig 
} from '@/VechainWalletKit'

function AppWithCustomSetup() {
  const adapter = usePrivyAdapter()

  return (
    <VechainWalletProvider config={config} adapter={adapter}>
      <YourAppContent />
    </VechainWalletProvider>
  )
}
```

## 📱 Using the Wallet Context

```tsx
import React from 'react'
import { useVechainWallet } from '@/VechainWalletKit'
import { TransactionClause } from '@vechain/sdk-core'

function WalletComponent() {
  const {
    address,
    isAuthenticated,
    isDeployed,
    signMessage,
    signTransaction,
    signTypedData,
    buildTransaction,
    login,
    logout,
  } = useVechainWallet()

  const handleSendTransaction = async () => {
    if (!isAuthenticated) return

    try {
      // Build transaction clauses
      const clauses: TransactionClause[] = [
        {
          to: '0x...',
          value: '0x0',
          data: '0x',
        },
      ]

      // Build the transaction
      const transaction = await buildTransaction(clauses, {
        gas: 21000,
        isDelegated: false,
      })

      // Sign the transaction
      const signature = await signTransaction(transaction)
      
      console.log('Transaction signed:', signature.toString('hex'))
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  const handleSignMessage = async () => {
    try {
      const message = Buffer.from('Hello VeChain!', 'utf8')
      const signature = await signMessage(message)
      console.log('Message signed:', signature.toString('hex'))
    } catch (error) {
      console.error('Signing failed:', error)
    }
  }

  if (!isAuthenticated) {
    return <div>Please connect your wallet</div>
  }

  return (
    <div>
      <h2>Wallet Info</h2>
      <p>Address: {address}</p>
      <p>Smart Account Deployed: {isDeployed ? 'Yes' : 'No'}</p>
      
      <div>
        <button onClick={handleSignMessage}>Sign Message</button>
        <button onClick={handleSendTransaction}>Send Transaction</button>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  )
}
```

## 🔧 Advanced Usage

### Smart Account Operations

The SDK automatically handles smart account operations:

```tsx
import { useSmartAccount } from '@/VechainWalletKit'

function SmartAccountInfo() {
  const { address } = useVechainWallet()
  const smartAccountHook = useSmartAccount({ 
    thor: thorClient, 
    networkName: 'testnet' 
  })

  const [smartAccount, setSmartAccount] = useState(null)
  
  useEffect(() => {
    if (address) {
      smartAccountHook.getSmartAccount(address).then(setSmartAccount)
    }
  }, [address])

  if (!smartAccount) return <div>Loading smart account info...</div>

  return (
    <div>
      <h3>Smart Account Details</h3>
      <p>Address: {smartAccount?.address}</p>
      <p>Deployed: {smartAccount?.isDeployed ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

### Custom Transaction Options

```tsx
const handleComplexTransaction = async () => {
  const clauses: TransactionClause[] = [
    {
      to: contractAddress,
      value: '0x0',
      data: encodedFunctionCall,
    },
  ]

  const transaction = await buildTransaction(clauses, {
    gas: 100000,
    isDelegated: true, // Use fee delegation
    dependsOn: previousTxId, // Transaction dependency
    gasPriceCoef: 128, // Gas price coefficient
  })

  const signature = await signTransaction(transaction)
}
```

### EIP-712 Typed Data Signing

```tsx
const handleSignTypedData = async () => {
  const typedData = {
    domain: {
      name: 'MyDApp',
      version: '1',
      chainId: 39, // This will be automatically set based on your network config
      verifyingContract: '0x...',
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Message: [
        { name: 'content', type: 'string' },
        { name: 'timestamp', type: 'uint256' },
      ],
    },
    message: {
      content: 'Hello VeChain!',
      timestamp: Date.now(),
    },
  }

  const signature = await signTypedData(typedData)
  console.log('Typed data signature:', signature)
}
```

## 🔌 Creating Custom Adapters

You can create custom wallet adapters using React hooks:

```tsx
import { useMemo } from 'react'
import { WalletAdapter, Account, TypedDataPayload, LoginOptions } from '@/VechainWalletKit'
import { Transaction } from '@vechain/sdk-core'

export const useCustomWalletAdapter = (customWallet: CustomWalletInstance): WalletAdapter => {
  const isAuthenticated = customWallet.isConnected()

  return useMemo(() => ({
    isAuthenticated,

    async signMessage(message: Buffer): Promise<Buffer> {
      // Implement your wallet's message signing
      const signature = await customWallet.signMessage(message)
      return Buffer.from(signature, 'hex')
    },

    async signTransaction(tx: Transaction): Promise<Buffer> {
      // Implement your wallet's transaction signing
      const signature = await customWallet.signTransaction(tx)
      return Buffer.from(signature, 'hex')
    },

    async signTypedData(data: TypedDataPayload): Promise<string> {
      // Implement your wallet's typed data signing
      return await customWallet.signTypedData(data)
    },

    async getAccount(): Promise<Account> {
      const account = await customWallet.getAccount()
      return {
        address: account.address,
        isDeployed: account.isDeployed,
      }
    },

    async login(options: LoginOptions): Promise<void> {
      await customWallet.connect(options)
    },

    async logout(): Promise<void> {
      await customWallet.disconnect()
    }
  }), [isAuthenticated, customWallet])
}
```

## 📋 Configuration Options

The `providerConfig` is adapter-specific and depends on which wallet provider you're using:

**For Privy Adapter:**
```tsx
providerConfig: {
  appId: 'your-privy-app-id',
  clientId: 'your-privy-client-id'
}
```

**For Custom Adapters:**
```tsx
providerConfig: {
  apiKey: 'your-api-key',
  environment: 'production',
  customOption: 'value'
  // Any configuration your adapter needs
}
```

## 📋 Network Configuration Options

### VechainWalletSDKConfig

```tsx
interface VechainWalletSDKConfig {
  networkConfig: {
    nodeUrl: string
    networkType: "mainnet" | "testnet"
  }
  providerConfig: Record<string, unknown>
}
```

### Network Configurations

**Testnet (with Privy):**
```tsx
const config = {
  networkConfig: {
    nodeUrl: 'https://testnet.vechain.org',
    networkType: 'testnet'
  },
  providerConfig: {
    // Privy-specific configuration
    appId: 'your-privy-app-id',
    clientId: 'your-privy-client-id'
  }
}
```

**Mainnet (with Privy):**
```tsx
const config = {
  networkConfig: {
    nodeUrl: 'https://mainnet.vechain.org',
    networkType: 'mainnet'
  },
  providerConfig: {
    // Privy-specific configuration
    appId: 'your-privy-app-id',
    clientId: 'your-privy-client-id'
  }
}
```

## 🛠️ Available Hooks

- `useVechainWallet()` - Main wallet context
- `useSmartAccount({ thor, networkName })` - Smart account management utilities
- `usePrivyAdapter()` - Privy wallet adapter (when using Privy)

## 🔐 Login Usage

The VechainWalletKit requires you to specify login options when calling the login method. This provides maximum flexibility and explicit control.

### Login Method

```tsx
const { login } = useVechainWallet()

// Login with Google
await login({ 
  provider: 'google',
  oauthRedirectUri: 'your-app://' 
})

// Login with Apple
await login({ 
  provider: 'apple',
  oauthRedirectUri: 'your-app://' 
})

// Login with Discord
await login({ 
  provider: 'discord',
  oauthRedirectUri: 'custom-scheme://' 
})
```

### Supported Providers

- `google`
- `apple`
- `discord`
- `github`
- `twitter`
- `linkedin`
- `spotify`
- `tiktok`
- `instagram`

### Dynamic Provider Selection

```tsx
function LoginScreen() {
  const { login } = useVechainWallet()
  
  const handleLogin = (provider: string) => {
    login({ 
      provider,
      oauthRedirectUri: 'your-app://' 
    })
  }

  return (
    <View>
      {['google', 'apple', 'discord'].map(provider => (
        <Button 
          key={provider}
          title={`Login with ${provider}`}
          onPress={() => handleLogin(provider)}
        />
      ))}
    </View>
  )
}
```

## ⚠️ Error Handling

The SDK provides typed error handling:

```tsx
import { WalletError, WalletErrorType } from '@/VechainWalletKit'

try {
  await signTransaction(transaction)
} catch (error) {
  if (error instanceof WalletError) {
    switch (error.type) {
      case WalletErrorType.SIGNATURE_REJECTED:
        console.error('User rejected signature')
        break
      case WalletErrorType.WALLET_NOT_FOUND:
        console.error('Wallet not found')
        break
      case WalletErrorType.INVALID_CONFIGURATION:
        console.error('Invalid configuration')
        break
      default:
        console.error('Unknown wallet error:', error.message)
    }
  }
}
```

## 🔄 Migration Guide

### From SocialLoginProvider

If you're migrating from the old `SocialLoginProvider`:

**Before:**
```tsx
<SocialLoginProvider>
  <App />
</SocialLoginProvider>
```

**After:**
```tsx
<VechainWalletWithPrivy config={config}>
  <App />
</VechainWalletWithPrivy>
```

The hook usage remains largely the same, but now you get additional features like smart account management and better transaction building.

## 📦 Exports

```tsx
// Main providers
export { VechainWalletProvider, useVechainWallet }
export { VechainWalletWithPrivy }

// Hooks
export { useSmartAccount }
export { usePrivyAdapter }

// Types (all types are exported via barrel export)
export type { 
  VechainWalletSDKConfig, 
  Account, 
  WalletAdapter,
  LoginOptions,
  TypedDataPayload,
  BuildOptions 
}

// Utils
export { buildSmartWalletTransactionClauses }
export { WalletError, WalletErrorType }
export * from './utils/smartAccountConfig'
```

## 🧪 Testing

The VechainWalletKit is fully tested with React Testing Library using behavioral testing approaches:

```tsx
import { renderHook, waitFor, act } from '@testing-library/react-native'
import { VechainWalletProvider, useVechainWallet } from '@/VechainWalletKit'

// Create a mock adapter for testing
const mockAdapter = {
  isAuthenticated: true,
  async signMessage() { return Buffer.from('mock-signature', 'hex') },
  async signTransaction() { return Buffer.from('mock-signature', 'hex') },
  async signTypedData() { return 'mock-signature' },
  async getAccount() { return { address: '0x123...', isDeployed: true } },
  async login() { /* mock login */ },
  async logout() { /* mock logout */ }
}

// Use in tests with direct hook testing
const createWrapper = (adapter: any) => ({ children }: { children: React.ReactNode }) => (
  <VechainWalletProvider config={mockConfig} adapter={adapter}>
    {children}
  </VechainWalletProvider>
)

test('should handle wallet operations', async () => {
  const wrapper = createWrapper(mockAdapter)
  const { result } = renderHook(() => useVechainWallet(), { wrapper })

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true)
  })

  await act(async () => {
    const signature = await result.current.signMessage(Buffer.from('test'))
    expect(signature).toEqual(Buffer.from('mock-signature', 'hex'))
  })
})
```

## 🎯 Benefits

1. **Provider Agnostic** - Easy to switch between wallet providers
2. **Smart Account Ready** - Built-in support for VeChain smart accounts
3. **Type Safe** - Full TypeScript support with proper error handling
4. **Modular** - Use only what you need
5. **Testable** - Comprehensive test suite with React Testing Library
6. **Future Proof** - Ready for extraction to npm package
7. **Clean Code** - No console.log statements in production code