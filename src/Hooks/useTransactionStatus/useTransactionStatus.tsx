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
import { FungibleTokenWithBalance, NonFungibleToken } from "~Model"

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

    const setTxPendingStatus = useCallback(
        ({
            txId,
            token,
        }: {
            txId: string
            token: FungibleTokenWithBalance | NonFungibleToken
        }) => {
            //todo.vas -> https://github.com/vechainfoundation/veworld-mobile/issues/804 [add VET suppoert]
            if (token?.hasOwnProperty("tokenId")) {
                const _token = token as NonFungibleToken
                setTransactionPending({ txId, id: _token.id })
            }

            if (token?.hasOwnProperty("balance")) {
                const _token = token as FungibleTokenWithBalance
                setTransactionPending({ txId, id: _token.address })
            }
        },
        [setTransactionPending],
    )

    // check reverted tx on Mainnet -> event is not arriving on websocket if tx is reverted??
    const prepareTxStatus = useCallback(
        async ({
            txId,
            token,
        }: {
            txId: string
            token: FungibleTokenWithBalance | NonFungibleToken
        }) => {
            // wait to to get tx id
            const txReceipt = await thor.transaction(txId).getReceipt()

            setTxPendingStatus({ txId, token })

            // if txReceipt is not null
            if (txReceipt && count < 10) {
                // if txReceipt is reverted
                if (txReceipt.reverted) {
                    info("txReceipt is reverted", txReceipt.meta.txOrigin)
                    setTransactionReverted({ txId })
                    removeTransactionPending({ txId })
                    return
                } else {
                }
            } else {
                // if txReceipt is still null -> retry for 10 times with a 1s delay
                setTimeout(async () => {
                    info("txReceipt is null, retrying...")
                    await prepareTxStatus({ txId, token })
                    increment()
                }, 1000)
            }
        },
        [
            thor,
            setTxPendingStatus,
            count,
            setTransactionReverted,
            removeTransactionPending,
            increment,
        ],
    )

    return {
        removeTransactionPending,
        setTransactionPending,
        prepareTxStatus,
    }
}
