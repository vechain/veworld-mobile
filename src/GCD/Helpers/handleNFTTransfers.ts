import { TransactionOrigin } from "~Model"
import { findInvolvedAccount } from "./findInvolvedAccount"
import {
    NFTTrnasferHandlerProps,
    informUSerForIncomingNFT,
    informUserForOutgoingNFT,
} from "."

export const handleNFTTransfers = async ({
    visibleAccounts,
    decodedTransfer,
    transfer,
    removeTransactionPending,
    fetchCollectionName,
    informUser,
}: NFTTrnasferHandlerProps) => {
    const foundAccount = findInvolvedAccount(visibleAccounts, decodedTransfer)

    // Early exit if tx is not related to any of the visible accounts
    if (!foundAccount.account) return

    const collectionName = await fetchCollectionName(transfer.address)

    // User received NFT
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successfull transfer
        informUSerForIncomingNFT({
            collectionName,
            from: transfer.meta.txOrigin,
            alias: foundAccount.account.alias,
            decodedTransfer,
            informUser,
        })
    }

    // User sent NFT
    if (foundAccount.origin === TransactionOrigin.FROM) {
        // we should wait for the indexer to index the transfer
        setTimeout(() => {
            // remove tx pending from redux
            removeTransactionPending({
                txId: transfer.meta.txID,
            })

            // inform usr for successfull transfer
            informUserForOutgoingNFT({
                txId: transfer.meta.txID,
                to: decodedTransfer.to,
                from: transfer.meta.txOrigin,
                collectionName,
                informUser,
            })
        }, 4000)
    }
}
