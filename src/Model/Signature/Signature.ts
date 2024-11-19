import { TypedDataDomain, TypedDataParameter } from "viem"
// import { Certificate, Transaction } from "thor-devkit"

// export type SignPayload = Certificate | Transaction

// export type SignType = "cert" | "tx"

export type TypedData = {
    domain: TypedDataDomain
    types: Record<string, TypedDataParameter[]>
    primaryType: string
    value: Record<string, unknown>
    opts?: Record<string, unknown>
    timestamp: number
    signer: string
    genesisId?: string
    signature?: string
}

export type SignedTypedDataResponse = {
    signature: TypedData["signature"]
}
