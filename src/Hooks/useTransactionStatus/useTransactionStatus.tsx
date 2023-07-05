import { useCallback } from "react"
import { Linking } from "react-native"
import {
    ToastType,
    showSuccessToast,
    useThor,
    showErrorToast,
} from "~Components"
import { defaultMainNetwork } from "~Constants"
import { useCounter } from "~Hooks/useCounter"
import { TransactionOrigin } from "~Model"
import {
    removePendingTransaction,
    selectSelectedNetwork,
    setPendingTransaction,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { info } from "~Utils"
import { getTranslation } from "./Helpers"

export const useTransactionStatus = () => {
    const dispatch = useAppDispatch()
    const thor = useThor()

    const network = useAppSelector(selectSelectedNetwork)

    const { count, increment } = useCounter()

    // todo - fix toast info and text based on type and origin
    const informUser = useCallback(
        ({
            txId,
            originType,
            toastType,
        }: {
            txId: string
            originType: TransactionOrigin
            toastType: ToastType
        }) => {
            const translationKeys = getTranslation(originType)

            if (toastType === ToastType.Error) {
                showErrorToast(
                    translationKeys[0],
                    translationKeys[1],
                    translationKeys[2],
                    async () => {
                        await Linking.openURL(
                            `${
                                network.explorerUrl ??
                                defaultMainNetwork.explorerUrl
                            }/transactions/${txId}`,
                        )
                    },
                )
            }

            if (toastType === ToastType.Success) {
                showSuccessToast(
                    translationKeys[0],
                    translationKeys[1],
                    translationKeys[2],
                    async () => {
                        await Linking.openURL(
                            `${
                                network.explorerUrl ??
                                defaultMainNetwork.explorerUrl
                            }/transactions/${txId}`,
                        )
                    },
                    "transactionSuccessToast",
                )
            }
        },
        [network.explorerUrl],
    )

    const setTransactionPending = useCallback(
        ({ txId, id }: { txId: string; id: string }) => {
            dispatch(setPendingTransaction({ txId, id }))
        },
        [dispatch],
    )

    const removeTransactionPending = useCallback(
        ({ txId }: { txId: string }) => {
            dispatch(removePendingTransaction({ txId }))
        },
        [dispatch],
    )

    const setTransactionReverted = useCallback(
        ({
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            txId,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            id,
        }: {
            txId: string
            id: string
        }) => {
            informUser({
                txId,
                originType: TransactionOrigin.FROM,
                toastType: ToastType.Error,
            })
        },
        [informUser],
    )

    const prepareTransactionStatus = useCallback(
        async ({ txId, id }: { txId: string; id: string }) => {
            // set pending immediately
            setTransactionPending({ txId, id })

            // wait to to get tx id
            const txReceipt = await thor.transaction(txId).getReceipt()

            // if txReceipt is not null
            if (txReceipt && count < 10) {
                // if txReceipt is reverted
                if (txReceipt.reverted) {
                    info("txReceipt is reverted")
                    setTransactionReverted({ txId, id })
                    return
                }
            } else {
                // if txReceipt is still null -> retry for 20 times with a 1s delay
                setTimeout(async () => {
                    info("txReceipt is null, retrying...")
                    await prepareTransactionStatus({ txId, id })
                    increment()
                }, 1000)
            }
        },
        [setTransactionPending, thor, count, setTransactionReverted, increment],
    )

    return { removeTransactionPending, prepareTransactionStatus, informUser }
}
