export * from "./TransferEventHandlers"

import { AccountWithDevice, Network } from "~Model"
import { IncomingTransferResponse } from "~Networking"

export interface BaseTransferHandlerProps {
    visibleAccounts: AccountWithDevice[]
    transfers: IncomingTransferResponse[]
    informUser: (params: { accountAddress: string; txId?: string }) => void
}

export interface NFTTransferHandlerProps extends BaseTransferHandlerProps {
    network: Network
    thorClient: Connex.Thor
    updateNFTs: (params: { network: string; accountAddress: string }) => void
}

export interface TokenTransferHandlerProps extends BaseTransferHandlerProps {
    fetchData: (
        address: string,
    ) => Promise<{ name: string; symbol: string; decimals: number }>
    updateBalances: (params: { accountAddress: string }) => void
}

export interface VETTransferHandlerProps extends BaseTransferHandlerProps {
    updateBalances: (params: { accountAddress: string }) => void
}
