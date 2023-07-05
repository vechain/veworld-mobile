import { Transaction } from "thor-devkit"
import { useThor } from "~Components"
import { ActivityType, Network, WalletAccount } from "~Model"
import {
    addPendingTransferTransactionActivity,
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
    // const { LL } = useI18nContext()
    const thorClient = useThor()

    const sendTransactionAndPerformUpdates = async (tx: Transaction) => {
        const id = await sendTransaction(tx, network.currentUrl)
        const type = ActivityUtils.getActivityTypeFromClause(tx.body.clauses)

        if (type === ActivityType.NFT_TRANSFER) {
            // todo - handle NFT activity?
        } else {
            // todo - Add pending transaction activity
            dispatch(addPendingTransferTransactionActivity(tx, thorClient))
        }

        await dispatch(updateAccountBalances(thorClient, account.address))

        // todo - remove and use on components?
        // showSuccessToast(
        //     LL.SUCCESS_GENERIC(),
        //     LL.SUCCESS_GENERIC_OPERATION(),
        //     LL.SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
        //     async () => {
        //         await Linking.openURL(
        //             `${
        //                 network.explorerUrl ?? defaultMainNetwork.explorerUrl
        //             }/transactions/${id}`,
        //         )
        //     },
        //     "transactionSuccessToast",
        // )

        return id
    }

    return { sendTransactionAndPerformUpdates }
}
