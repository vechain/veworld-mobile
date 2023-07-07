export const TRANSFER_SIGNATURE =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

export * from "./findInvolvedAccount"
export * from "./TranslationHelpers"
export * from "./handleTokenTransfers"
export * from "./handleVETTransfers"
export * from "./handleNFTTransfers"

import {
    AccountWithDevice,
    Network,
    TransferEvent,
    TransferEventResult,
    VetTransferEvent,
} from "~Model"

export interface BaseTrnasferHandlerProps {
    visibleAccounts: AccountWithDevice[]
    decodedTransfer: TransferEventResult
    transfer: TransferEvent
    checkIfReverted: (params: { txId: string }) => Promise<void>
    removeTransactionPending: (params: { txId: string }) => void
    network: Network
    reconciliationAction: (params: { accountAddress: string }) => void
}

export interface NFTTrnasferHandlerProps extends BaseTrnasferHandlerProps {
    fetchCollectionName: (address: string) => Promise<string>
}

export interface TokenTrnasferHandlerProps extends BaseTrnasferHandlerProps {
    fetchData: (
        address: string,
    ) => Promise<{ symbol: string; decimals: number }>
}

export interface VETTransferHandlerProps {
    transfer: VetTransferEvent
    visibleAccounts: AccountWithDevice[]
    removeTransactionPending: (params: { txId: string }) => void
    checkIfReverted: (params: { txId: string }) => Promise<void>
    network: Network
    reconciliationAction: (params: { accountAddress: string }) => void
}
