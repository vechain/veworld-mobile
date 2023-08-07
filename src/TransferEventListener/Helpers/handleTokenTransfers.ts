import {
    addOrUpdateCustomToken,
    updateAccountBalances,
    upsertTokenBalance,
} from "~Storage/Redux"
import { findInvolvedAccount } from "./findInvolvedAccount"
import {
    InformUserForIncomingToken,
    InformUserForOutgoingToken,
    TokenTransferHandlerProps,
} from "./index"
import { TransactionOrigin } from "~Model"
import { isVechainToken } from "~Utils/TokenUtils/TokenUtils"

export const handleTokenTransfers = async ({
    visibleAccounts,
    transfer,
    network,
    thorClient,
    fetchData,
    stateReconciliationAction,
    informUser,
    dispatch,
}: TokenTransferHandlerProps) => {
    const foundAccount = findInvolvedAccount(visibleAccounts, transfer)

    if (!foundAccount.account) return

    const { name, symbol, decimals } = await fetchData(transfer.tokenAddress)

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

        dispatch(
            addOrUpdateCustomToken({
                accountAddress: foundAccount.account.address,
                newToken: {
                    address: transfer.tokenAddress,
                    symbol,
                    decimals,
                    custom: !isVechainToken(symbol),
                    genesisId: network.genesis.id,
                    icon: "",
                    name,
                },
            }),
        )

        await dispatch(
            upsertTokenBalance(
                thorClient,
                foundAccount.account.address,
                transfer.tokenAddress,
            ),
        )

        await dispatch(
            updateAccountBalances(thorClient, foundAccount.account.address),
        )

        stateReconciliationAction({
            network: network.type,
            accountAddress: transfer.to,
        })
    }

    // User send token
    if (foundAccount.origin === TransactionOrigin.FROM) {
        // inform usr for successfull transfer
        InformUserForOutgoingToken({
            txId: transfer.txId,
            amount: transfer.value || "0",
            decimals,
            transfer,
            informUser,
        })

        stateReconciliationAction({
            network: network.type,
            accountAddress: transfer.from,
        })

        stateReconciliationAction({
            network: network.type,
            accountAddress: transfer.to,
        })
    }
}
