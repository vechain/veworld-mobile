import { TypedDataDomain } from "ethers"

export interface TypedDataPayload {
    domain: TypedDataDomain
    types: Record<string, unknown>
    message: Record<string, unknown>
}

export interface SignOptions {
    delegateFor?: string
}

export interface BuildOptions {
    gas?: number
    isDelegated?: boolean
    dependsOn?: string
    gasPriceCoef?: number
    selectedAccountAddress?: string
} 