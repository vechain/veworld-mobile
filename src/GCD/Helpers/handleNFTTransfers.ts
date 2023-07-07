import { TransactionOrigin } from "~Model"
import { findInvolvedAccount } from "./findInvolvedAccount"
import {
    NFTTrnasferHandlerProps,
    informUSerForIncomingNFT,
    informUserForOutgoingNFT,
} from "."
import { info } from "~Utils"

export const handleNFTTransfers = async ({
    visibleAccounts,
    decodedTransfer,
    transfer,
    checkIfReverted,
    network,
    removeTransactionPending,
    fetchCollectionName,
}: NFTTrnasferHandlerProps) => {
    const foundAccount = findInvolvedAccount(visibleAccounts, decodedTransfer)

    // Early exit if tx is not related to any of the visible accounts
    if (!foundAccount.account) return

    const collectionName = await fetchCollectionName(transfer.address)

    // check if tx is reverted
    await checkIfReverted({ txId: transfer.meta.txID })

    // User received NFT
    if (foundAccount.origin === TransactionOrigin.TO) {
        // todo.vas - pass action from above
        const action = () => info("User tapped on NFT Banner for incoming")

        // inform user for successfull transfer
        informUSerForIncomingNFT({
            collectionName,
            from: transfer.meta.txOrigin,
            alias: foundAccount.account.alias,
            action,
        })

        // reload NFT collections from indexer
        //todo.vas
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
                collectionName,
                network,
            })

            // reload NFT collections from indexer
            //todo.vas
        }, 4000)
    }
}
