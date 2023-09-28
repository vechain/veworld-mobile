import { AccountWithDevice, NftCollection, TransactionOrigin } from "~Model"
import { EventTypeResponse, IncomingTransferResponse } from "~Networking"
import { AddressUtils } from "~Utils"

export const filterNFTTransferEvents = (
    transfers: IncomingTransferResponse[],
    blackListedCollections: NftCollection[],
): IncomingTransferResponse[] =>
    transfers.filter(
        t =>
            t.eventType === EventTypeResponse.NFT &&
            !blackListedCollections
                .map(c => c.address)
                .includes(t.tokenAddress),
    )

export const filterTransferEventsByType = (
    transfers: IncomingTransferResponse[],
    eventType: EventTypeResponse,
): IncomingTransferResponse[] =>
    transfers.filter(t => t.eventType === eventType)

export interface InvolvedAcct {
    account: AccountWithDevice
    origin: TransactionOrigin
}

export const findFirstInvolvedAccount = (
    visibleAccounts: AccountWithDevice[],
    decodedTransfer: IncomingTransferResponse,
): InvolvedAcct | undefined => {
    let origin

    const foundAccount = visibleAccounts.find(acc => {
        if (AddressUtils.compareAddresses(acc.address, decodedTransfer.to)) {
            origin = TransactionOrigin.TO
            return acc
        }

        // NOTE - if a user transfers to himself (same or different account), the transfer will be indexed as an outgoing operation
        if (AddressUtils.compareAddresses(acc.address, decodedTransfer.from)) {
            origin = TransactionOrigin.FROM
            return acc
        }
    })

    if (!foundAccount || !origin) return undefined

    return {
        account: foundAccount,
        origin,
    }
}
