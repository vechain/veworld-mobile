export const TRANSFER_SIGNATURE =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

export * from "./findInvolvedAccount"
export * from "./TranslationHelpers"
export * from "./handleTokenTransfers"
export * from "./handleVETTransfers"
export * from "./handleNFTTransfers"

import {
    AccountWithDevice,
    TransferEvent,
    TransferEventResult,
    VetTransferEvent,
} from "~Model"

export interface BaseTrnasferHandlerProps {
    visibleAccounts: AccountWithDevice[]
    decodedTransfer: TransferEventResult
    transfer: TransferEvent
    removeTransactionPending: (params: { txId: string }) => void
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export interface NFTTrnasferHandlerProps extends BaseTrnasferHandlerProps {
    fetchCollectionName: (address: string) => Promise<string>
}

export interface TokenTrnasferHandlerProps extends BaseTrnasferHandlerProps {
    fetchData: (
        address: string,
    ) => Promise<{ symbol: string; decimals: number }>
    stateReconciliationAction: (params: { accountAddress: string }) => void
}

export interface VETTransferHandlerProps {
    transfer: VetTransferEvent
    visibleAccounts: AccountWithDevice[]
    removeTransactionPending: (params: { txId: string }) => void
    stateReconciliationAction: (params: { accountAddress: string }) => void
    informUser: (params: { accountAddress: string; txId?: string }) => void
}
