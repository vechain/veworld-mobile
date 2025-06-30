import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { TransactionOptions, SignOptions, TypedDataPayload } from "./transaction"
export interface SigningOperations {
    signMessage: (message: Buffer) => Promise<Buffer>
    signTransaction: (tx: Transaction, options?: SignOptions) => Promise<Buffer>
    signTypedData: (data: TypedDataPayload) => Promise<string>
}

export interface WalletContext extends SigningOperations {
    address: string
    buildTransaction: (clauses: TransactionClause[], options?: TransactionOptions) => Promise<Transaction>
}
export interface AuthenticationOperations {
    isAuthenticated: boolean
    login: (options: LoginOptions) => Promise<void>
    logout: () => Promise<void>
}

export interface SmartWalletContext extends WalletContext, AuthenticationOperations {
    isDeployed: boolean
    createWallet(): Promise<void>
}
export interface SmartAccountAdapter extends SigningOperations, AuthenticationOperations {
    createWallet(): Promise<void>
    getAccount(): string
}

export interface LoginOptions {
    provider: "google" | "apple" | "twitter"
    oauthRedirectUri: string
}
