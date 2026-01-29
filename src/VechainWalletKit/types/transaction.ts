import { TypedDataDomain } from "ethers"
import { BigNumberUtils } from "../../Utils"

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

export interface GenericDelegatorRates {
    rate: {
        vtho: number
        vet: number
        b3tr: number
    }
    serviceFee: number
}

export interface GenericDelegationDetails {
    token: string
    tokenAddress: string
    fee: BigNumberUtils | undefined
    depositAccount: string
    rates: GenericDelegatorRates | undefined
}
