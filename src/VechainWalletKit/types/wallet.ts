import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { TransactionOptions, SignOptions, TypedDataPayload, GenericDelegationDetails } from "./transaction"
import { SmartAccountTransactionConfig } from "./smartAccountTransaction"
import { LinkWithOAuthInput, OAuthFlowState, PrivyUser } from "@privy-io/expo"
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
    /**
     * Estimate gas for a smart account transaction.
     * Builds the full smart account clauses (including any delegation transfer) and returns total gas.
     * @param clauses - The transaction clauses to estimate gas for
     * @param genericDelegation - Optional delegation details (uses mock fee internally for estimation)
     * @returns The total gas estimate
     */
    estimateGas: (clauses: TransactionClause[], genericDelegation?: GenericDelegationDetails) => Promise<number>
}
export interface AuthenticationOperations {
    isAuthenticated: boolean
    isReady: boolean
    login: (options: LoginOptions) => Promise<void>
    logout: () => Promise<void>
}

export type LinkWithOAuth = {
    link: (provider: SocialProvider, opts?: Omit<LinkWithOAuthInput, "provider">) => Promise<PrivyUser | undefined>
} & OAuthFlowState

export interface SmartWalletContext extends WalletContext, AuthenticationOperations {
    isLoading: boolean
    isInitialized: boolean
    ownerAddress: string
    smartAccountAddress: string
    smartAccountConfig: SmartAccountTransactionConfig | null
    linkedAccounts: LinkedAccount[]
    userDisplayName: string | null
    hasMultipleSocials: boolean
    initialiseWallet: () => Promise<void>
    linkOAuth: LinkWithOAuth
    unlinkOAuth: (provider: SocialProvider, subject: string) => Promise<PrivyUser | undefined>
}

export interface SmartAccountAdapter extends SigningOperations, AuthenticationOperations {
    getAccount(): string
    createWallet(): Promise<string>
    linkOAuth: LinkWithOAuth
    unlinkOAuth: (provider: SocialProvider, subject: string) => Promise<PrivyUser | undefined>
    linkedAccounts: LinkedAccount[]
    userDisplayName: string | null
    hasMultipleSocials: boolean
}

export interface LoginOptions {
    provider: "google" | "apple" | "twitter"
    oauthRedirectUri: string
}

export type SocialProvider = "google" | "apple" | "twitter"

export interface LinkedAccount {
    type: SocialProvider
    email?: string | null
    subject: string
}
