import { findInvolvedAccount } from "./findInvolvedAccount"
import {
    InformUserForIncomingToken,
    InformUserForOutgoingToken,
    TokenTransferHandlerProps,
} from "./index"
import { TransactionOrigin } from "~Model"

export const handleTokenTransfers = async ({
    visibleAccounts,
    transfer,
    fetchData,
    stateReconciliationAction,
    informUser,
}: TokenTransferHandlerProps) => {
    const foundAccount = findInvolvedAccount(visibleAccounts, transfer)

    if (!foundAccount.account) return

    const { symbol, decimals } = await fetchData(transfer.tokenAddress)

    // User received token
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successful transfer
        InformUserForIncomingToken({
            amount: transfer.value || "0",
            symbol,
            decimals,
            alias: foundAccount.account.alias,
            transfer,
            informUser,
        })

        stateReconciliationAction({ accountAddress: transfer.to })
    }

    // User send token
    if (foundAccount.origin === TransactionOrigin.FROM) {
        // inform usr for successfull transfer
        InformUserForOutgoingToken({
            txId: transfer.txId,
            amount: transfer.value || "0",
            symbol,
            decimals,
            transfer,
            to: transfer.to,
            informUser,
        })

        stateReconciliationAction({
            accountAddress: transfer.from,
        })

        stateReconciliationAction({
            accountAddress: transfer.to,
        })
    }
}
