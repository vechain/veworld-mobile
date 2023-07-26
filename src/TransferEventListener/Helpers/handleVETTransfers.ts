import { TransactionOrigin } from "~Model"
import {
    findInvolvedAccount,
    InformUserForIncomingVET,
    InformUserForOutgoingVET,
    VETTransferHandlerProps,
} from "./index"

export const handleVETTransfers = ({
    transfer,
    visibleAccounts,
    stateReconciliationAction,
    informUser,
}: VETTransferHandlerProps) => {
    const foundAccount = findInvolvedAccount(visibleAccounts, transfer)

    if (!foundAccount.account) return

    // User received token
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successful transfer
        InformUserForIncomingVET({
            alias: foundAccount.account.alias,
            amount: transfer.value,
            to: transfer.to,
            informUser,
        })

        stateReconciliationAction({ accountAddress: transfer.to })
    }

    // User send token
    if (foundAccount.origin === TransactionOrigin.FROM) {
        // inform usr for successfull transfer
        InformUserForOutgoingVET({
            txId: transfer.txId,
            amount: transfer.value,
            to: transfer.to,
            from: transfer.from,
            informUser,
        })

        stateReconciliationAction({ accountAddress: transfer.to })
        stateReconciliationAction({ accountAddress: transfer.from })
    }
}
