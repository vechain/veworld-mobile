import { useCallback } from "react"
import { useThor } from "~Components"
import { informUserforRevertedTransaction } from "../../GCD/Helpers"
import { useCounter } from "~Hooks/useCounter"
import {
    removePendingTransaction,
    selectSelectedNetwork,
    setPendingTransaction,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { info } from "~Utils"

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
            informUserforRevertedTransaction({
                txId,
                network,
            })
        },
        [network],
    )

    // check reverted tx on Mainnet -> event is not arriving on websocket if tx is reverted??
    const checkIfReverted = useCallback(
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
                // if txReceipt is still null -> retry for 10 times with a 1s delay
                setTimeout(async () => {
                    info("txReceipt is null, retrying...")
                    await checkIfReverted({ txId })
                    increment()
                }, 1000)
            }
        },
        [thor, count, setTransactionReverted, increment],
    )

    return {
        removeTransactionPending,
        setTransactionPending,
        checkIfReverted,
    }
}
