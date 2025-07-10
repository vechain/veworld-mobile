import { TypedDataDomain } from "ethers"

export interface TypedDataPayload {
    domain: TypedDataDomain
    types: Record<string, unknown>
    message: Record<string, unknown>
}

export interface SignOptions {
    delegateFor?: string
}

export interface TransactionOptions {
    gas?: number
    isDelegated?: boolean
    dependsOn?: string
    gasPriceCoef?: number
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
}
