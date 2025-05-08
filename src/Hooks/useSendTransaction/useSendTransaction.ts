import { showSuccessToast, useThor } from "~Components"
import {
    selectLastReviewTimestamp,
    selectSelectedAccount,
    selectSelectedNetwork,
    setIsAppLoading,
    setLastReviewTimestamp,
    updateAccountBalances,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, HexUtils } from "~Utils"
import axios, { AxiosError, AxiosResponse } from "axios"
import { Linking } from "react-native"
import { ERROR_EVENTS, defaultMainNetwork } from "~Constants"
import { useI18nContext } from "~i18n"
import InAppReview from "react-native-in-app-review"
import moment from "moment"
import { Transaction } from "@vechain/sdk-core"
/**
 * Hooks that expose a function to send a transaction and perform updates, showing a toast on success
 * @param onSuccess the function to handle success
 * @returns {sendTransactionAndPerformUpdates} the function to send the transaction and perform updates
 */
export const useSendTransaction = (onSuccess: (transaction: Transaction, id: string) => Promise<void> | void) => {
    const dispatch = useAppDispatch()
    const thorClient = useThor()
    const { LL } = useI18nContext()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const lastReviewTimestamp = useAppSelector(selectLastReviewTimestamp)

    const sendTransaction = async (signedTransaction: Transaction): Promise<string> => {
        dispatch(setIsAppLoading(true))

        const encodedRawTx = {
            raw: HexUtils.addPrefix(Buffer.from(signedTransaction.encoded).toString("hex")),
        }

        let response: AxiosResponse

        try {
            response = await axios.post(`${selectedNetwork.currentUrl}/transactions`, encodedRawTx)
        } catch (e) {
            if (e instanceof AxiosError) {
                const axiosError = e as AxiosError

                error(ERROR_EVENTS.SEND, {
                    axiosErros: JSON.stringify(axiosError.toJSON()),
                    data: axiosError.response?.data,
                })
            } else {
                try {
                    error(ERROR_EVENTS.SEND, JSON.stringify(e))
                } catch (_) {
                    error(ERROR_EVENTS.SEND, e)
                }
            }

            throw e
        }

        const { id } = response.data

        await onSuccess(signedTransaction, id)

        showSuccessToast({
            text1: LL.SUCCESS_GENERIC(),
            text2: LL.SUCCESS_GENERIC_OPERATION(),
            textLink: LL.NOTIFICATION_SEE_TRANSACTION_DETAILS_ACTION(),
            onPress: async () => {
                await Linking.openURL(
                    `${selectedNetwork.explorerUrl ?? defaultMainNetwork.explorerUrl}/transactions/${id}`,
                )
            },
            visibilityTime: 4000,
            testID: "transactionSuccessToast",
        })

        // this will ask for the review after 3 weeks if the user has not reviewed the app yet
        const nextReviewDate = moment(lastReviewTimestamp).add(3, "weeks")
        const isTimeForANewReview = moment().isAfter(nextReviewDate)

        if (InAppReview.isAvailable() && isTimeForANewReview) {
            InAppReview.RequestInAppReview()
                .then(() => {
                    dispatch(setLastReviewTimestamp(new Date().toISOString()))
                })
                .catch(inAppReviewError => {
                    error(ERROR_EVENTS.SEND, `InAppReview error: ${inAppReviewError}`)
                })
        }

        try {
            await dispatch(updateAccountBalances(thorClient, selectedAccount.address))
        } catch (balanceError) {
            // Log the balance update error but don't re-throw,
            // as sending the transaction succeeded.
            error(
                ERROR_EVENTS.SEND,
                "Error updating balances after successfully sending a transaction: " + id,
                balanceError,
            )
        }

        return id
    }

    return { sendTransaction }
}
