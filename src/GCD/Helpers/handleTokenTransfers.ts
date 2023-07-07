import { findInvolvedAccount } from "./findInvolvedAccount"
import {
    InformUserForIncomingToken,
    InformUserForOutgoingToken,
    TokenTrnasferHandlerProps,
} from "."
import { TransactionOrigin } from "~Model"
import { info } from "~Utils"

export const handleTokenTransfers = async ({
    visibleAccounts,
    decodedTransfer,
    checkIfReverted,
    transfer,
    fetchData,
    network,
    removeTransactionPending,
    reconciliationAction,
}: TokenTrnasferHandlerProps) => {
    const foundAccount = findInvolvedAccount(visibleAccounts, decodedTransfer)

    if (!foundAccount.account) return

    // check if tx is reverted
    await checkIfReverted({ txId: transfer.meta.txID })

    const { symbol, decimals } = await fetchData(transfer.address)

    // todo.vas - pass action from above
    const action = () => info("User tapped on token Banner for incoming")

    // User received token
    if (foundAccount.origin === TransactionOrigin.TO) {
        // inform user for successfull transfer
        InformUserForIncomingToken({
            amount: decodedTransfer.value || "0",
            symbol,
            decimals,
            alias: foundAccount.account.alias,
            action,
        })

        // reload balances
        reconciliationAction({ accountAddress: foundAccount.account.address })
    }

    // User send token
    if (foundAccount.origin === TransactionOrigin.FROM) {
        // remove tx pending from redux
        removeTransactionPending({ txId: transfer.meta.txID })

        // inform usr for successfull transfer
        InformUserForOutgoingToken({
            txId: transfer.meta.txID,
            network,
            amount: decodedTransfer.value || "0",
            symbol,
            decimals,
            to: decodedTransfer.to,
        })

        // reload balance
        reconciliationAction({ accountAddress: foundAccount.account.address })
    }
}
