import {
    createRecentContact,
    invalidateUserTokens,
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
import { ERROR_EVENTS } from "~Constants"
import InAppReview from "react-native-in-app-review"
import moment from "moment"
import { Transaction } from "@vechain/sdk-core"
import { useQueryClient } from "@tanstack/react-query"
/**
 * Hooks that expose a function to send a transaction and perform updates, showing a toast on success
 * @param onSuccess the function to handle success
 * @returns {sendTransactionAndPerformUpdates} the function to send the transaction and perform updates
 */
export const useSendTransaction = (onSuccess: (transaction: Transaction, id: string) => Promise<void> | void) => {
    const dispatch = useAppDispatch()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const lastReviewTimestamp = useAppSelector(selectLastReviewTimestamp)
    const queryClient = useQueryClient()

    const sendTransaction = async (signedTransaction: Transaction): Promise<string> => {
        dispatch(setIsAppLoading(true))

        const encodedRawTx = {
            raw: HexUtils.addPrefix(Buffer.from(signedTransaction.encoded).toString("hex")),
        }

        let response: AxiosResponse
        let id: string = ""

        try {
            response = await axios.post(`${selectedNetwork.currentUrl}/transactions`, encodedRawTx)
            id = response.data.id
            await onSuccess(signedTransaction, id)

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
                await dispatch(invalidateUserTokens(selectedAccount.address, queryClient))
                await dispatch(updateAccountBalances(selectedAccount.address, queryClient))
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
        } finally {
            dispatch(createRecentContact(signedTransaction.body.clauses, selectedNetwork.genesis.id))
            // Ensure app loading state is reset even if there's an error
            dispatch(setIsAppLoading(false))
        }
    }

    return { sendTransaction }
}
