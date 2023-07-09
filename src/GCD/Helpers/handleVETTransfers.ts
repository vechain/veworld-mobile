import { TransactionOrigin } from "~Model"
import {
    InformUserForIncomingVET,
    InformUserForOutgoingVET,
    VETTransferHandlerProps,
    findInvolvedAccount,
} from "."

export const handleVETTransfers = ({
    transfer,
    visibleAccounts,
    removeTransactionPending,
    stateReconciliationAction,
    informUser,
}: VETTransferHandlerProps) => {
    const foundAccount = findInvolvedAccount(visibleAccounts, {
        from: transfer.sender,
        to: transfer.recipient,
        value: transfer.amount,
    })

    if (!foundAccount.account) return

    // User received token
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successfull transfer
        InformUserForIncomingVET({
            alias: foundAccount.account.alias,
            amount: transfer.amount,
            to: transfer.recipient,
            informUser,
        })

        stateReconciliationAction({ accountAddress: transfer.recipient })
    }

    // User send token
    if (foundAccount.origin === TransactionOrigin.FROM) {
        // remove tx pending from redux
        removeTransactionPending({ txId: transfer.meta.txID })

        // inform usr for successfull transfer
        InformUserForOutgoingVET({
            txId: transfer.meta.txID,
            amount: transfer.amount,
            to: transfer.recipient,
            from: transfer.sender,
            informUser,
        })

        stateReconciliationAction({ accountAddress: transfer.sender })
        stateReconciliationAction({ accountAddress: transfer.recipient })
    }
}
