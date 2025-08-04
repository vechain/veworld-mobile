import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { TransactionOptions, SignOptions, TypedDataPayload, GenericDelegationDetails } from "./transaction"
export interface SigningOperations {
    signMessage: (message: Buffer) => Promise<Buffer>
    signTransaction: (tx: Transaction, options?: SignOptions) => Promise<Buffer>
    signTypedData: (data: TypedDataPayload) => Promise<string>
}

export interface WalletContext extends SigningOperations {
    ownerAddress: string
    buildTransaction: (
        clauses: TransactionClause[],
        options?: TransactionOptions,
        genericDelgation?: GenericDelegationDetails,
    ) => Promise<Transaction>
}
export interface AuthenticationOperations {
    isAuthenticated: boolean
    login: (options: LoginOptions) => Promise<void>
    logout: () => Promise<void>
}

export interface SmartWalletContext extends WalletContext, AuthenticationOperations {
    isLoading: boolean
    isInitialized: boolean
    ownerAddress: string
    smartAccountAddress: string
    initialiseWallet: () => Promise<void>
}
export interface SmartAccountAdapter extends SigningOperations, AuthenticationOperations {
    getAccount(): string
    createWallet(): Promise<string>
}

export interface LoginOptions {
    provider: "google" | "apple" | "twitter"
    oauthRedirectUri: string
}
