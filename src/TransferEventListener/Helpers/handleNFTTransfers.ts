import { TransactionOrigin } from "~Model"
import { findInvolvedAccount } from "./findInvolvedAccount"
import {
    informUserForIncomingNFT,
    informUserForOutgoingNFT,
    BaseTransferHandlerProps,
} from "./index"
import { getName } from "~Networking"

export const handleNFTTransfers = async ({
    visibleAccounts,
    transfer,
    network,
    thorClient,
    stateReconciliationAction,
    informUser,
}: BaseTransferHandlerProps) => {
    const foundAccount = findInvolvedAccount(visibleAccounts, transfer)

    // Early exit if tx is not related to any of the visible accounts
    if (!foundAccount.account) return

    const collectionName = await getName(transfer.tokenAddress, thorClient)

    // User received NFT
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successful transfer
        informUserForIncomingNFT({
            collectionName,
            from: transfer.from,
            alias: foundAccount.account.alias, // this should be read by typescript as it is already checked on line 21
            transfer,
            informUser,
        })

        stateReconciliationAction({
            network: network.type,
            accountAddress: transfer.to,
        })
        stateReconciliationAction({
            network: network.type,
            accountAddress: transfer.from,
        })
    }

    // User sent NFT
    if (foundAccount.origin === TransactionOrigin.FROM) {
        // inform user for successful transfer
        informUserForOutgoingNFT({
            txId: transfer.txId,
            to: transfer.to,
            from: transfer.from,
            collectionName,
            informUser,
        })

        stateReconciliationAction({
            network: network.type,
            accountAddress: transfer.to,
        })
        stateReconciliationAction({
            network: network.type,
            accountAddress: transfer.from,
        })
    }
}
