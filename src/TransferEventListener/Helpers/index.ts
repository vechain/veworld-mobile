export const TRANSFER_SIGNATURE =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

export * from "./findInvolvedAccount"
export * from "./TranslationHelpers"
export * from "./handleTokenTransfers"
export * from "./handleVETTransfers"
export * from "./handleNFTTransfers"
export * from "./fetchTransfersForBlock"

import { AccountWithDevice, Network } from "~Model"
import { IncomingTransferResponse } from "~Networking"
import { AppThunkDispatch } from "~Storage/Redux/Types"

export interface BaseTransferHandlerProps {
    visibleAccounts: AccountWithDevice[]
    transfer: IncomingTransferResponse
    network: Network
    thorClient: Connex.Thor
    informUser: (params: { accountAddress: string; txId?: string }) => void
    stateReconciliationAction: (params: {
        network: string
        accountAddress: string
    }) => void
}

export interface TokenTransferHandlerProps extends BaseTransferHandlerProps {
    fetchData: (
        address: string,
    ) => Promise<{ name: string; symbol: string; decimals: number }>
    dispatch: AppThunkDispatch
}

export interface VETTransferHandlerProps {
    transfer: IncomingTransferResponse
    visibleAccounts: AccountWithDevice[]
    stateReconciliationAction: (params: { accountAddress: string }) => void
    informUser: (params: { accountAddress: string; txId?: string }) => void
}
