import { Transaction } from "thor-devkit"
import { useThor } from "~Components"
import {
    selectSelectedAccount,
    selectSelectedNetwork,
    setIsAppLoading,
    updateAccountBalances,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, HexUtils } from "~Utils"
import axios, { AxiosError, AxiosResponse } from "axios"

/**
 * Hooks that expose a function to send a transaction and perform updates, showing a toast on success
 * @param onSuccess the function to handle success
 * @returns {sendTransactionAndPerformUpdates} the function to send the transaction and perform updates
 */
export const useSendTransaction = (
    onSuccess: (transaction: Transaction, id: string) => Promise<void> | void,
) => {
    const dispatch = useAppDispatch()
    const thorClient = useThor()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const sendTransaction = async (
        signedTransaction: Transaction,
    ): Promise<string> => {
        dispatch(setIsAppLoading(true))

        const encodedRawTx = {
            raw: HexUtils.addPrefix(signedTransaction.encode().toString("hex")),
        }

        let response: AxiosResponse

        try {
            response = await axios.post(
                `${selectedNetwork.currentUrl}/transactions`,
                encodedRawTx,
            )
        } catch (e) {
            if (e instanceof Error && "isAxiosError" in e) {
                const axiosError = e as AxiosError

                error(
                    "sendTransaction error",
                    JSON.stringify(axiosError.response),
                )
            } else {
                error("sendTransaction error", e)
            }

            throw e
        }

        const { id } = response.data

        await onSuccess(signedTransaction, id)

        await dispatch(
            updateAccountBalances(thorClient, selectedAccount.address),
        )

        return id
    }

    return { sendTransaction }
}
