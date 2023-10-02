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

/**
 * @returns the first account involved in the transfer
 * @param visibleAccounts - all visible accounts
 * @param decodedTransfer - the transfer to check
 * @param priorityAccount - if provided, this account will be returned if it is involved in the transfer
 *
 */
export const findFirstInvolvedAccount = (
    visibleAccounts: AccountWithDevice[],
    decodedTransfer: IncomingTransferResponse,
    priorityAccount?: AccountWithDevice,
): InvolvedAcct | undefined => {
    // First check the priority account if provided
    let foundAccount: InvolvedAcct | undefined

    if (priorityAccount) {
        foundAccount = findFirstAccountInTransferResponse(
            [priorityAccount],
            decodedTransfer,
        )
    }

    // If priority account was not found or not provided, check all accounts
    if (!foundAccount) {
        foundAccount = findFirstAccountInTransferResponse(
            visibleAccounts,
            decodedTransfer,
        )
    }

    return foundAccount
}

const findFirstAccountInTransferResponse = (
    accounts: AccountWithDevice[],
    decodedTransfer: IncomingTransferResponse,
): InvolvedAcct | undefined => {
    let origin: TransactionOrigin | undefined
    const foundAccount = accounts.find(acc => {
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
