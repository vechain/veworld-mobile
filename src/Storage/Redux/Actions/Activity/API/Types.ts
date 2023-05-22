import { Transaction } from "thor-devkit"

type OutputResponse = {
    contractAddress: string
    events: Connex.VM.Event[]
    transfers: Connex.VM.Transfer[]
}

export type FetchTransactionsResponse = {
    id: string
    blockId: string
    blockNumber: number
    blockTimestamp: number
    size: number
    chainTag: number
    blockRef: string
    expiration: number
    clauses: Transaction.Clause[]
    gasPriceCoef: number
    gas: number
    dependsOn: string
    nonce: string
    gasUsed: number
    gasPayer: string
    paid: string
    reward: string
    reverted: true
    origin: string
    outputs: OutputResponse[]
}

export type FetchBlockResponse = {
    blockId: string
    number: number
    size: number
    parentID: string
    timestamp: number
    gasLimit: number
    beneficiary: string
    gasUsed: number
    totalScore: number
    txsRoot: string
    txsFeatures: number
    stateRoot: string
    receiptsRoot: string
    com: boolean
    signer: string
    isTrunk: boolean
    isFinalized: boolean
    transactions: FetchTransactionsResponse[]
}
