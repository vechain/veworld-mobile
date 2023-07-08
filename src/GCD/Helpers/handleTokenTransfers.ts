import { findInvolvedAccount } from "./findInvolvedAccount"
import {
    InformUserForIncomingToken,
    InformUserForOutgoingToken,
    TokenTrnasferHandlerProps,
} from "."
import { TransactionOrigin } from "~Model"

export const handleTokenTransfers = async ({
    visibleAccounts,
    decodedTransfer,
    transfer,
    fetchData,
    removeTransactionPending,
    stateReconciliationAction,
    informUser,
}: TokenTrnasferHandlerProps) => {
    const foundAccount = findInvolvedAccount(visibleAccounts, decodedTransfer)

    if (!foundAccount.account) return

    const { symbol, decimals } = await fetchData(transfer.address)

    // User received token
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successfull transfer
        InformUserForIncomingToken({
            amount: decodedTransfer.value || "0",
            symbol,
            decimals,
            alias: foundAccount.account.alias,
            decodedTransfer,
            informUser,
        })

        stateReconciliationAction({ accountAddress: decodedTransfer.to })
    }

    // User send token
    if (foundAccount.origin === TransactionOrigin.FROM) {
        // remove tx pending from redux
        removeTransactionPending({ txId: transfer.meta.txID })

        // inform usr for successfull transfer
        InformUserForOutgoingToken({
            txId: transfer.meta.txID,
            amount: decodedTransfer.value || "0",
            symbol,
            decimals,
            decodedTransfer,
            to: decodedTransfer.to,
            informUser,
        })

        stateReconciliationAction({
            accountAddress: foundAccount.account.address,
        })
    }
}
