import { TransactionOrigin } from "~Model"
import {
    InformUserForIncomingVET,
    InformUserForOutgoingVET,
    VETTransferHandlerProps,
    findInvolvedAccount,
} from "."
import { info } from "~Utils"

export const handleVETTransfers = async ({
    transfer,
    visibleAccounts,
    removeTransactionPending,
    checkIfReverted,
    network,
    reconciliationAction,
}: VETTransferHandlerProps): Promise<void> => {
    const foundAccount = findInvolvedAccount(visibleAccounts, {
        from: transfer.sender,
        to: transfer.recipient,
        value: transfer.amount,
    })

    if (!foundAccount.account) return

    // check if tx is reverted
    await checkIfReverted({ txId: transfer.meta.txID })

    // todo.vas - pass action from above
    const action = () => info("User tapped on VET Banner for incoming")

    // User received token
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successfull transfer
        InformUserForIncomingVET({
            action,
            alias: foundAccount.account.alias,
            amount: transfer.amount,
        })

        // reload balances
        reconciliationAction({ accountAddress: foundAccount.account.address })
    }

    // User send token
    if (foundAccount.origin === TransactionOrigin.FROM) {
        // remove tx pending from redux
        removeTransactionPending({ txId: transfer.meta.txID })

        // inform usr for successfull transfer
        InformUserForOutgoingVET({
            txId: transfer.meta.txID,
            network,
            amount: transfer.amount,
            to: transfer.recipient,
        })

        // reload balances
        reconciliationAction({ accountAddress: foundAccount.account.address })
    }
}
