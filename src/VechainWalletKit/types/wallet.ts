import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { TypedDataPayload } from "./transaction"
import { SmartAccountTransactionConfig } from "./transactionBuilder"

export interface Account {
    address: string
    balance?: string
    isDeployed: boolean
}

export interface WalletAdapter {
    signMessage(message: Buffer): Promise<Buffer>
    signTransaction(tx: Transaction): Promise<Buffer>
    signTypedData(data: TypedDataPayload): Promise<string>
    getAccount(): Promise<Account>
    readonly isAuthenticated: boolean
}

export interface SmartAccountAdapter extends WalletAdapter {
    login(options: LoginOptions): Promise<void>
    logout(): Promise<void>
    buildTransaction(params: {
        txClauses: TransactionClause[]
        smartAccountConfig: SmartAccountTransactionConfig
        networkType: "mainnet" | "testnet"
    }): Promise<TransactionClause[]>
    isSmartAccountDeployed(address: string): Promise<boolean>
    getSmartAccountConfig(): Promise<SmartAccountTransactionConfig>
}

export interface LoginOptions {
    provider: "google" | "apple" | "discord" | "github" | "twitter" | "linkedin" | "spotify" | "tiktok" | "instagram"
    oauthRedirectUri: string
}
