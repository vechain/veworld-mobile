import { Transaction } from "thor-devkit"
import { useThor } from "~Components"
import { ActivityType, Network, WalletAccount } from "~Model"
import {
    addPendingDappTransactionActivity,
    addPendingNFTtransferTransactionActivity,
    addPendingTransferTransactionActivity,
    setIsAppLoading,
    updateAccountBalances,
    useAppDispatch,
} from "~Storage/Redux"
import { sendTransaction } from "~Networking"
import { ActivityUtils } from "~Utils"

/**
 * Hooks that expose a function to send a transaction and perform updates, showing a toast on success
 * @param network the network to send the transaction to
 * @param account the account to send the transaction from
 * @returns {sendTransactionAndPerformUpdates} the function to send the transaction and perform updates
 */
export const useSendTransaction = (
    network: Network,
    account: WalletAccount,
) => {
    const dispatch = useAppDispatch()
    const thorClient = useThor()

    const sendTransactionAndPerformUpdates = async (tx: Transaction) => {
        dispatch(setIsAppLoading(true))

        const id = await sendTransaction(tx, network.currentUrl)
        const type = ActivityUtils.getActivityTypeFromClause(tx.body.clauses)

        if (type === ActivityType.NFT_TRANSFER) {
            dispatch(addPendingNFTtransferTransactionActivity(tx))
        } else if (
            type === ActivityType.FUNGIBLE_TOKEN ||
            type === ActivityType.VET_TRANSFER
        ) {
            dispatch(addPendingTransferTransactionActivity(tx))
        } else if (type === ActivityType.DAPP_TRANSACTION) {
            dispatch(addPendingDappTransactionActivity(tx))
        }

        await dispatch(updateAccountBalances(thorClient, account.address))

        return id
    }

    return { sendTransactionAndPerformUpdates }
}
