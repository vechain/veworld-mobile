import { useCallback } from "react"
import { ToastType, useThor } from "~Components"
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
import { informUser } from "./Helpers"

export const useTransactionStatus = () => {
    const dispatch = useAppDispatch()
    const thor = useThor()

    const network = useAppSelector(selectSelectedNetwork)

    const { count, increment } = useCounter()

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
        ({ txId }: { txId: string }) => {
            informUser({
                txId,
                originType: TransactionOrigin.FROM,
                toastType: ToastType.Error,
                network,
            })
        },
        [network],
    )

    const prepareTransactionStatus = useCallback(
        async ({ txId }: { txId: string }) => {
            // wait to to get tx id
            const txReceipt = await thor.transaction(txId).getReceipt()

            // if txReceipt is not null
            if (txReceipt && count < 10) {
                // if txReceipt is reverted
                if (txReceipt.reverted) {
                    info("txReceipt is reverted")
                    setTransactionReverted({ txId })
                    return
                }
            } else {
                // if txReceipt is still null -> retry for 20 times with a 1s delay
                setTimeout(async () => {
                    info("txReceipt is null, retrying...")
                    await prepareTransactionStatus({ txId })
                    increment()
                }, 1000)
            }
        },
        [thor, count, setTransactionReverted, increment],
    )

    return {
        removeTransactionPending,
        setTransactionPending,
        informUser,
        prepareTransactionStatus,
    }
}
