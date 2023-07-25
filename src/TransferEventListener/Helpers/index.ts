export const TRANSFER_SIGNATURE =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

export * from "./findInvolvedAccount"
export * from "./TranslationHelpers"
export * from "./handleTokenTransfers"
export * from "./handleVETTransfers"
export * from "./handleNFTTransfers"
export * from "./fetchTransfersForBlock"

import { AccountWithDevice } from "~Model"
import { IncomingTransferResponse } from "~Networking"

export interface BaseTransferHandlerProps {
    visibleAccounts: AccountWithDevice[]
    transfer: IncomingTransferResponse
    informUser: (params: { accountAddress: string; txId?: string }) => void
    stateReconciliationAction: (params: { accountAddress: string }) => void
}

export interface NFTTransferHandlerProps extends BaseTransferHandlerProps {
    thor: Connex.Thor
}

export interface TokenTransferHandlerProps extends BaseTransferHandlerProps {
    fetchData: (
        address: string,
    ) => Promise<{ symbol: string; decimals: number }>
}

export interface VETTransferHandlerProps {
    transfer: IncomingTransferResponse
    visibleAccounts: AccountWithDevice[]
    stateReconciliationAction: (params: { accountAddress: string }) => void
    informUser: (params: { accountAddress: string; txId?: string }) => void
}
