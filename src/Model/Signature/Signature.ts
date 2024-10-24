import { ethers } from "ethers"
// import { Certificate, Transaction } from "thor-devkit"

// export type SignPayload = Certificate | Transaction

// export type SignType = "cert" | "tx"

export type TypedData = {
    domain: ethers.TypedDataDomain
    types: Record<string, ethers.TypedDataField[]>
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
