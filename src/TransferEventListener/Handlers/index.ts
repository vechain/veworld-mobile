export * from "./TransferEventHandlers"

import { AccountWithDevice, Network } from "~Model"
import { FetchIncomingTransfersResponse } from "~Networking"

export interface BaseTransferHandlerProps {
    selectedAccount: AccountWithDevice
    visibleAccounts: AccountWithDevice[]
    transfers: FetchIncomingTransfersResponse["data"]
}

export interface NFTTransferHandlerProps extends BaseTransferHandlerProps {
    network: Network
    updateNFTs: (params: { network: Network; accountAddress: string }) => void
}

export interface TokenTransferHandlerProps extends BaseTransferHandlerProps {
    updateBalances: (params: { accountAddress: string }) => void
}
