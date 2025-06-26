import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { SignOptions, TypedDataPayload } from "./transaction"
import { BuildOptions } from "typescript"

export interface Account {
    address: string
    balance?: string
    isDeployed: boolean
}

export interface SmartAccountInfo {
    address: string | undefined
    isDeployed: boolean
    hasV1Account: boolean | undefined
    version: number | undefined
    factoryAddress: string
}

export interface VechainWalletContext {
    // Core wallet info
    address: string
    isAuthenticated: boolean

    // Smart account info
    smartAccount: SmartAccountInfo

    // Authentication methods
    signMessage: (message: Buffer) => Promise<Buffer>
    signTransaction: (tx: Transaction, options?: SignOptions) => Promise<Buffer>
    signTypedData: (data: TypedDataPayload) => Promise<string>

    // Transaction methods
    buildTransaction: (clauses: TransactionClause[], options?: BuildOptions) => Promise<Transaction>

    // Authentication management
    logout: () => Promise<void>
}

export interface WalletAdapter {
    signMessage(message: Buffer): Promise<Buffer>
    signTransaction(tx: Transaction): Promise<Buffer>
    signTypedData(data: TypedDataPayload): Promise<string>
    getAccount(): Promise<Account>
    login(options: LoginOptions): Promise<void>
    logout(): Promise<void>
    readonly isAuthenticated: boolean
}

export interface LoginOptions {
    provider: "google" | "apple" | "discord" | "github" | "twitter" | "linkedin" | "spotify" | "tiktok" | "instagram"
    oauthRedirectUri: string
}
