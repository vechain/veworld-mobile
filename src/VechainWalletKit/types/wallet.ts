import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { TransactionOptions, SignOptions, TypedDataPayload } from "./transaction"

/**
 * Context interface for a VeChain Wallet Provider.
 */
export interface WalletContext {
    address: string

    signMessage: (message: Buffer) => Promise<Buffer>
    signTransaction: (tx: Transaction, options?: SignOptions) => Promise<Buffer>
    signTypedData: (data: TypedDataPayload) => Promise<string>
    buildTransaction: (clauses: TransactionClause[], options?: TransactionOptions) => Promise<Transaction>
}

/**
 * Context interface for a VeChain Smart Wallet Provider
 */
export interface SmartWalletContext extends WalletContext {
    isAuthenticated: boolean
    isDeployed: boolean
    // Authentication management
    login: (options: LoginOptions) => Promise<void>
    logout: () => Promise<void>
}
export interface Account {
    address: string
}

export interface WalletAdapter {
    signMessage(message: Buffer): Promise<Buffer>
    signTransaction(tx: Transaction): Promise<Buffer>
    signTypedData(data: TypedDataPayload): Promise<string>
    getAccount(): Promise<Account>
}

export interface SmartAccountAdapter extends WalletAdapter {
    login(options: LoginOptions): Promise<void>
    logout(): Promise<void>
    readonly isAuthenticated: boolean
}

export interface LoginOptions {
    provider: "google" | "apple" | "twitter"
    oauthRedirectUri: string
}
