import React, { useCallback } from "react"
// import useWebSocket from "react-use-websocket"
import {
    // selectSelectedAccount,
    selectSelectedNetwork,
    selectVisibleAccounts,
    // updateNodeError,
    // useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { TransactionUtils, error, info } from "~Utils"
import { useWsUrlForTokens } from "./Hooks"
import { findInvolvedAccount } from "./Helpers"
import { useTransactionStatus } from "~Hooks"
import { TransactionOrigin } from "~Model"
import { ToastType } from "~Components"

const GCD: React.FC = () => {
    // const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const visibleAccounts = useAppSelector(selectVisibleAccounts)

    const { removeTransactionPending, informUser } = useTransactionStatus()

    // const { wsUrlForVET, isVetWSOpen } = useWsUrlForVET(
    //     currentAccount,
    //     network.currentUrl,
    // )

    const onTokenMessage = useCallback(
        async (ev: WebSocketMessageEvent) => {
            try {
                const transfer = JSON.parse(ev.data) as TransferEvent

                const decodedTransfer =
                    TransactionUtils.decodeTransferEvent(transfer)

                if (decodedTransfer?.tokenId) {
                    const foundAccount = findInvolvedAccount(
                        visibleAccounts,
                        decodedTransfer,
                    )

                    if (!foundAccount) return

                    if (foundAccount.origin === TransactionOrigin.TO) {
                        info("TO : ", {
                            account: foundAccount.account?.address,
                            txOrigin: transfer.meta.txOrigin,
                        })

                        // inform user for successfull transfer
                        informUser({
                            txId: transfer.meta.txID,
                            originType: TransactionOrigin.TO,
                            toastType: ToastType.Success,
                        })

                        // reload NFT collections from indexer
                    }

                    if (foundAccount.origin === TransactionOrigin.FROM) {
                        info("FROM : ", {
                            account: foundAccount.account?.address,
                            txOrigin: transfer.meta.txOrigin,
                        })

                        setTimeout(() => {
                            // remove tx pending from redux
                            removeTransactionPending({
                                txId: transfer.meta.txID,
                            })

                            // inform usr for successfull transfer
                            informUser({
                                txId: transfer.meta.txID,
                                originType: TransactionOrigin.FROM,
                                toastType: ToastType.Success,
                            })

                            // reload NFT collections from indexer
                        }, 4000)
                    }
                }

                if (decodedTransfer?.value) {
                    const foundAccount = findInvolvedAccount(
                        visibleAccounts,
                        decodedTransfer,
                    )

                    if (!foundAccount) return

                    if (foundAccount.origin === "to") {
                    }

                    if (foundAccount.origin === "from") {
                        // inform usr
                    }
                }
            } catch (e) {
                error(e)
            }
        },
        [informUser, removeTransactionPending, visibleAccounts],
    )

    useWsUrlForTokens(network.currentUrl, onTokenMessage)

    // const onVETMessage = useCallback(async (ev: WebSocketMessageEvent) => {
    //     const transfer = JSON.parse(ev.data) as VetTransferEvent

    //     info("transfer VET - VTHO", transfer)

    //     // updateBalances()

    //     // toast.success(
    //     //     LL.NOTIFICATION_received_token_transfer({
    //     //         amount: FormattingUtils.scaleNumberDown(
    //     //             transfer.amount,
    //     //             VET.decimals,
    //     //         ),
    //     //         symbol: VET.symbol,
    //     //     }),
    //     // )
    // }, [])

    // useWebSocket(
    //     wsUrlForTokens,
    //     {
    //         onMessage: onTokenMessage,
    //         onOpen: ev => {
    //             info("Beat WS open on: ", ev.currentTarget)
    //             dispatch(updateNodeError(false))
    //         },
    //         onError: ev => {
    //             error(ev)
    //         },
    //         onClose: ev => info(ev),
    //         shouldReconnect: () => true,
    //         retryOnError: true,
    //         reconnectAttempts: 10_000,
    //         reconnectInterval: 1_000,
    //     },
    //     isTokenWSOpen,
    // )

    // useWebSocket(
    //     wsUrlForVET,
    //     {
    //         onMessage: onVETMessage,
    //         onOpen: ev => {
    //             info("Beat WS open on: ", ev.currentTarget)
    //             dispatch(updateNodeError(false))
    //         },
    //         onError: ev => {
    //             error(ev)
    //         },
    //         onClose: ev => info(ev),
    //         shouldReconnect: () => true,
    //         retryOnError: true,
    //         reconnectAttempts: 10_000,
    //         reconnectInterval: 1_000,
    //     },
    //     isVetWSOpen,
    // )

    return <></>
}

interface TransferEvent {
    address: string
    topics: string[]
    data: string
    meta: {
        blockID: string
        blockNumber: number
        blockTimestamp: number
        txID: string
        txOrigin: string
        clauseIndex: number
    }
    obsolete: boolean
}

// interface VetTransferEvent {
//     amount: string
//     meta: {
//         blockID: string
//         blockNumber: number
//         blockTimestamp: number
//         clauseIndex: number
//         txID: string
//         txOrigin: string
//     }
//     recipient: string
//     sender: string
// }

export default GCD

/*
                    use cases:
                        - I send NFT to other
                        - I receive NFT from other
                            - I can show a tost saying (you received NFT from other(adddress) to your account(address))

                            - If selected account is not included in transfer data, I can still show the toast and on tap of toast I can switch selected account?

                            - If selected account is included in transfer data, I can show the toast and on tap of toast I can go to nft tab and refresh by calling the indexer from the begining

                            ~ QUESITON: 
                            - If the NFT is not indexed on the first page the user would just need to scroll? How does he know what NFT he has received?
                */
