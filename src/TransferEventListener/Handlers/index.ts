export * from "./TransferEventHandlers"

import { AccountWithDevice, Network } from "~Model"
import { IncomingTransferResponse } from "~Networking"

export interface BaseTransferHandlerProps {
    selectedAccount: AccountWithDevice
    visibleAccounts: AccountWithDevice[]
    transfers: IncomingTransferResponse[]
}

export interface NFTTransferHandlerProps extends BaseTransferHandlerProps {
    network: Network
    updateNFTs: (params: { network: string; accountAddress: string }) => void
}

export interface TokenTransferHandlerProps extends BaseTransferHandlerProps {
    updateBalances: (params: { accountAddress: string }) => void
}

export interface VETTransferHandlerProps extends BaseTransferHandlerProps {
    updateBalances: (params: { accountAddress: string }) => void
}
