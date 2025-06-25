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
│                   BaseAdapter                           │
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
    network: 'testnet', // or 'mainnet'
    nodeUrl: 'https://testnet.vechain.org',
    chainId: 39, // 39 for testnet, 100009 for mainnet
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
  PrivyAdapter, 
  VechainWalletSDKConfig 
} from '@/VechainWalletKit'
import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo'

function AppWithCustomSetup() {
  const { user, logout } = usePrivy()
  const { wallets } = useEmbeddedEthereumWallet()
  
  const adapter = new PrivyAdapter(
    () => user,
    () => wallets || [],
    () => logout
  )

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
import { useVechainWalletContext } from '@/VechainWalletKit'
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
    logout,
  } = useVechainWalletContext()

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
  const { address } = useVechainWalletContext()
  const { data: smartAccount, isLoading } = useSmartAccount(address)

  if (isLoading) return <div>Loading smart account info...</div>

  return (
    <div>
      <h3>Smart Account Details</h3>
      <p>Address: {smartAccount?.address}</p>
      <p>Deployed: {smartAccount?.isDeployed ? 'Yes' : 'No'}</p>
      <p>Version: {smartAccount?.version}</p>
      <p>Has V1 Account: {smartAccount?.hasV1Account ? 'Yes' : 'No'}</p>
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
    selectedAccountAddress: specificSmartAccountAddress,
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
      chainId: 39,
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

You can create custom adapters for other wallet providers:

```tsx
import { BaseAdapter } from '@/VechainWalletKit'
import { Account, TypedDataPayload } from '@/VechainWalletKit/types'

export class CustomWalletAdapter extends BaseAdapter {
  constructor(private customWallet: CustomWalletInstance) {
    super()
  }

  async signMessage(message: Buffer): Promise<Buffer> {
    // Implement your wallet's message signing
    const signature = await this.customWallet.signMessage(message)
    return Buffer.from(signature, 'hex')
  }

  async signTransaction(tx: Transaction): Promise<Buffer> {
    // Implement your wallet's transaction signing
    const signature = await this.customWallet.signTransaction(tx)
    return Buffer.from(signature, 'hex')
  }

  async signTypedData(data: TypedDataPayload): Promise<string> {
    // Implement your wallet's typed data signing
    return await this.customWallet.signTypedData(data)
  }

  async getAccount(): Promise<Account> {
    const account = await this.customWallet.getAccount()
    return {
      address: account.address,
      isDeployed: account.isDeployed,
    }
  }

  async logout(): Promise<void> {
    await this.customWallet.disconnect()
    this.setAuthenticated(false)
  }
}
```

## 📋 Configuration Options

### VechainWalletSDKConfig

```tsx
interface VechainWalletSDKConfig {
  networkConfig: {
    network: 'mainnet' | 'testnet'
    nodeUrl: string
    chainId: number
  }
  providerConfig: {
    appId: string
    clientId: string
  }
}
```

### Network Configurations

**Testnet:**
```tsx
networkConfig: {
  network: 'testnet',
  nodeUrl: 'https://testnet.vechain.org',
  chainId: 39,
}
```

**Mainnet:**
```tsx
networkConfig: {
  network: 'mainnet',
  nodeUrl: 'https://mainnet.vechain.org',
  chainId: 100009,
}
```

## 🛠️ Available Hooks

- `useVechainWalletContext()` - Main wallet context
- `useSmartAccount(address)` - Smart account information
- `useWalletTransaction(config)` - Transaction building utilities

## ⚠️ Error Handling

The SDK provides typed error handling:

```tsx
import { WalletError, WalletErrorType } from '@/VechainWalletKit'

try {
  await signTransaction(transaction)
} catch (error) {
  if (error instanceof WalletError) {
    switch (error.type) {
      case WalletErrorType.CONNECTION_FAILED:
        console.error('Wallet not connected')
        break
      case WalletErrorType.SIGNATURE_REJECTED:
        console.error('User rejected signature')
        break
      case WalletErrorType.NETWORK_ERROR:
        console.error('Network error occurred')
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
export { VechainWalletProvider, useVechainWalletContext }
export { VechainWalletWithPrivy }

// Adapters
export { PrivyAdapter, BaseAdapter }

// Hooks
export { useSmartAccount, useWalletTransaction }

// Types
export type { 
  VechainWalletSDKConfig, 
  Account, 
  SmartAccountInfo,
  TypedDataPayload,
  SignOptions,
  BuildOptions 
}

// Utils
export { WalletError, WalletErrorType }
```

## 🎯 Benefits

1. **Provider Agnostic** - Easy to switch between wallet providers
2. **Smart Account Ready** - Built-in support for VeChain smart accounts
3. **Type Safe** - Full TypeScript support with proper error handling
4. **Modular** - Use only what you need
5. **Testable** - Easy to mock adapters for testing
6. **Future Proof** - Ready for extraction to npm package

## 🧪 Testing

You can easily mock the wallet context for testing:

```tsx
import { VechainWalletProvider } from '@/VechainWalletKit'

// Create a mock adapter for testing
class MockAdapter extends BaseAdapter {
  async signMessage() { return Buffer.from('mock-signature', 'hex') }
  async signTransaction() { return Buffer.from('mock-signature', 'hex') }
  async signTypedData() { return 'mock-signature' }
  async getAccount() { return { address: '0x123...', isDeployed: true } }
  async logout() { this.setAuthenticated(false) }
}

// Use in tests
<VechainWalletProvider config={mockConfig} adapter={new MockAdapter()}>
  <ComponentUnderTest />
</VechainWalletProvider>
``` 