import { useCallback, useRef } from "react"
import { useThor } from "~Components"
import { informUserforRevertedTransaction } from "../../TransferEventListener"
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
    const count = useRef(0)

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

            count.current <= 0 && setTxPendingStatus({ txId, token })

            // if txReceipt is not null
            if (txReceipt && count.current < 10) {
                // if txReceipt is reverted
                if (txReceipt.reverted) {
                    info("txReceipt is reverted", txReceipt.meta.txOrigin)
                    setTransactionReverted({ txId })
                    removeTransactionPending({ txId }) // todo.vas do not persist pending state on redux
                    return
                } else {
                }
            } else {
                // if txReceipt is still null -> retry for 10 times with a 1s delay
                count.current = count.current + 1

                setTimeout(async () => {
                    info("txReceipt is null, retrying...")
                    await prepareTxStatus({ txId, token })
                }, 1000)
            }
        },
        [
            thor,
            setTxPendingStatus,
            setTransactionReverted,
            removeTransactionPending,
            count,
        ],
    )

    return {
        removeTransactionPending,
        setTransactionPending,
        prepareTxStatus,
    }
}
