# VechainWalletKit

A modular, provider-agnostic wallet SDK for VeChain applications with smart account support and transaction building capabilities.

## 🏗️ Architecture

VechainWalletKit uses an adapter pattern to abstract away specific wallet providers (like Privy) from your application logic. This makes it easy to switch providers by creating custom implementations.

This kit can be used with react native applications. Currently a Privy expo adapter is provided.

```
┌─────────────────────────────────────────────────────────┐
│                    Your App                             │
├─────────────────────────────────────────────────────────┤
│              SmartWalletProvider                        │
│                (Provider Agnostic)                      │
├─────────────────────────────────────────────────────────┤
│               SmartAccountAdapter                       │
│                   (Interface)                           │
├─────────────────────────────────────────────────────────┤
│   PrivyAdapter     │   CustomAdapter    │    ...        │
│   (Privy Impl)     │   (Your Impl)      │               │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Dependencies

The following dependencies are required to use the built in Privy implementation:

-   yarn add "@vechain/sdk-core"
-   yarn add "@vechain/sdk-network"
-   yarn add "@privy-io/expo"
-   npx expo install expo-apple-authentication expo-application expo-crypto expo-linking expo-secure-store expo-web-browser react-native-passkeys react-native-webview @privy-io/expo-native-extensions @privy-io/expo
-   yarn add fast-text-encoding react-native-get-random-values @ethersproject/shims

### Option 1: Using with Privy expo (Recommended for most users)

```tsx
import React from "react"
import { SmartWalletWithPrivyProvider, VechainWalletSDKConfig } from "@/VechainWalletKit"

const config: VechainWalletSDKConfig = {
    networkConfig: {
        nodeUrl: "https://testnet.vechain.org",
        networkType: "testnet", // or 'mainnet'
    },
    providerConfig: {
        appId: "your-privy-app-id",
        clientId: "your-privy-client-id",
    },
}

function App() {
    return (
        <SmartWalletWithPrivyProvider config={config}>
            <YourAppContent />
        </SmartWalletWithPrivyProvider>
    )
}
```

### Option 2: Using with Custom Adapter

```tsx
import React from "react"
import { SmartWalletProvider, usePrivyExpoAdapter, VechainWalletSDKConfig } from "@/VechainWalletKit"
import { useCustomAdapter } from "@/your-custom-adapter"

function AppWithCustomSetup() {
    const adapter = useCustomAdapter()

    const config: VechainWalletSDKConfig = {
        networkConfig: {
            nodeUrl: "https://testnet.vechain.org",
            networkType: "testnet", // or 'mainnet'
        },
    }

    return (
        <SmartWalletProvider config={config} adapter={adapter}>
            <YourAppContent />
        </SmartWalletProvider>
    )
}
```

## 📱 Using the Wallet Context

```tsx
import React from "react"
import { useVechainWallet } from "@/VechainWalletKit"
import { TransactionClause } from "@vechain/sdk-core"

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
        initialiseWallet,
    } = useSmartWallet()

    const handleCreateWallet = async () => {
        await initialiseWallet()
    }

    const handleSendTransaction = async () => {
        if (!isAuthenticated || !isInitialised) return

        try {
            // Build transaction clauses
            const clauses: TransactionClause[] = [
                {
                    to: "0x...",
                    value: "0x0",
                    data: "0x",
                },
            ]

            // Build the transaction (automatically handles building a transaction for a smart account contract)
            const transaction = await buildTransaction(clauses, {
                gas: 21000,
                isDelegated: false,
            })

            // Sign the transaction
            const signature = await signTransaction(transaction)

            const signedTransaction = Transaction.of(transaction.body, signature)

            const encodedRawTx = {
                raw: HexUtils.addPrefix(Buffer.from(signedTransaction.encoded).toString("hex")),
            }

            await axios.post(`https://testnet.vechain.org/transactions`, encodedRawTx)
        } catch (error) {
            console.error("Transaction failed:", error)
        }
    }

    const handleSignMessage = async () => {
        try {
            const message = Buffer.from("Hello VeChain!", "utf8")
            const signature = await signMessage(message)
            console.log("Message signed:", signature.toString("hex"))
        } catch (error) {
            console.error("Signing failed:", error)
        }
    }

    if (!isAuthenticated) {
        return <div>Please connect your wallet</div>
    }

    return (
        <div>
            <h2>Wallet Info</h2>
            <p>Address: {address}</p>
            <p>Smart Account Deployed: {isDeployed ? "Yes" : "No"}</p>

            <div>
                <button onClick={handleCreateWallet}>Create Wallet</button>
                <button onClick={handleSignMessage}>Sign Message</button>
                <button onClick={handleSendTransaction}>Send Transaction</button>
                <button onClick={logout}>Logout</button>
            </div>
        </div>
    )
}
```

## 🔧 Advanced Usage

### EIP-712 Typed Data Signing

```tsx
const handleSignTypedData = async () => {
    const typedData = {
        domain: {
            name: "MyDApp",
            version: "1",
            chainId: 39, // This will be automatically set based on your network config
            verifyingContract: "0x...",
        },
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            Message: [
                { name: "content", type: "string" },
                { name: "timestamp", type: "uint256" },
            ],
        },
        primaryType: "Message",
        message: {
            content: "Hello VeChain!",
            timestamp: Date.now(),
        },
    }

    const signature = await signTypedData(typedData)
    console.log("Typed data signature:", signature)
}
```

## 🔌 Creating Custom Adapters

You can create custom wallet adapters using React hooks. The adapter pattern allows you to use any provider that allows you to sign transactions, typed data, and messages. Privy is already supported, but you can create your own adapter to use other providers, or even use a local private key. As long as your adapter implements the SmartAccountAdapter interface, it will work with the SmartWalletProvider.

```tsx
import { useMemo } from "react"
import { SmartAccountAdapter, Account, TypedDataPayload, LoginOptions } from "@/VechainWalletKit"
import { Transaction } from "@vechain/sdk-core"

export const useCustomWalletAdapter = (customWallet: CustomWalletInstance): SmartAccountAdapter => {
    const isAuthenticated = customWallet.isConnected()

    return useMemo(
        () => ({
            isAuthenticated,

            async signMessage(message: Buffer): Promise<Buffer> {
                // Implement your wallet's message signing
                const signature = await customWallet.signMessage(message)
                return Buffer.from(signature, "hex")
            },

            async signTransaction(tx: Transaction): Promise<Buffer> {
                // Implement your wallet's transaction signing
                const signature = await customWallet.signTransaction(tx)
                return Buffer.from(signature, "hex")
            },

            async signTypedData(data: TypedDataPayload): Promise<string> {
                // Implement your wallet's typed data signing
                return await customWallet.signTypedData(data)
            },

            async getAccount(): Promise<Account> {
                const account = await customWallet.getAccount()
                return {
                    address: account.address,
                }
            },

            async login(options: LoginOptions): Promise<void> {
                await customWallet.connect(options)
            },

            async logout(): Promise<void> {
                await customWallet.disconnect()
            },
            async createWallet(): Promise<void> {
                await customWallet.create()
            },
        }),
        [isAuthenticated, customWallet],
    )
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
You can add any configuration your adapter needs to the providerConfig object.

```tsx
providerConfig: {
  apiKey: 'your-api-key',
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
        networkType: "mainnet" | "testnet" | "solo"
    }
    providerConfig: Record<string, unknown>
}
```

### Network Configurations

**Testnet (with Privy):**

```tsx
const config = {
    networkConfig: {
        nodeUrl: "https://testnet.vechain.org",
        networkType: "testnet",
    },
    providerConfig: {
        // Privy-specific configuration
        appId: "your-privy-app-id",
        clientId: "your-privy-client-id",
    },
}
```

**Mainnet (with Privy):**

```tsx
const config = {
    networkConfig: {
        nodeUrl: "https://mainnet.vechain.org",
        networkType: "mainnet",
    },
    providerConfig: {
        // Privy-specific configuration
        appId: "your-privy-app-id",
        clientId: "your-privy-client-id",
    },
}
```

## 🛠️ Available Hooks

-   `useSmartWallet()` - Main wallet context with authentication and transaction management. This is the main hook you will use to access all wallet features. It acts as a facade for the underlying adapter.
-   `usePrivyAdapter()` - Privy wallet adapter

## 🔐 Login Usage

The VechainWalletKit requires you to specify login options when calling the login method.

### Login Method

```tsx
const { login } = useSmartWallet()

// Login with Google
await login({
    provider: "google",
    oauthRedirectUri: "your-app://",
})

// Login with Apple
await login({
    provider: "apple",
    oauthRedirectUri: "your-app://",
})

// Login with Twitter
await login({
    provider: "twitter",
    oauthRedirectUri: "custom-scheme://",
})
```

## ⚠️ Error Handling

The SDK provides typed error handling:

```tsx
import { WalletError, WalletErrorType } from "@/VechainWalletKit"

try {
    await signTransaction(transaction)
} catch (error) {
    if (error instanceof WalletError) {
        switch (error.type) {
            case WalletErrorType.SIGNATURE_REJECTED:
                console.error("User rejected signature")
                break
            case WalletErrorType.WALLET_NOT_FOUND:
                console.error("Wallet not found")
                break
            default:
                console.error("Unknown wallet error:", error.message)
        }
    }
}
```

## 🔄 Smart Account Transaction Building

The SDK automatically handles smart account transactions with the following features:

-   **Automatic Deployment**: If the smart account isn't deployed, it will be deployed automatically
-   **Version Detection**: Automatically detects V1 vs V3+ smart accounts
-   **Batch Execution**: V3+ smart accounts use batch execution for better efficiency
-   **Individual Execution**: V1 smart accounts use individual execution for each transaction clause
-   **Gas Estimation**: Automatically estimates gas requirements including deployment costs
