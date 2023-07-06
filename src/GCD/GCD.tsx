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
    const network = useAppSelector(selectSelectedNetwork)
    const visibleAccounts = useAppSelector(selectVisibleAccounts)

    const { removeTransactionPending, informUser, prepareTransactionStatus } =
        useTransactionStatus()

    const onTokenMessage = useCallback(
        async (ev: WebSocketMessageEvent) => {
            try {
                const transfer = JSON.parse(ev.data) as TransferEvent

                const decodedTransfer =
                    TransactionUtils.decodeTransferEvent(transfer)

                // ~ NFT TRANSFER
                if (decodedTransfer?.tokenId) {
                    const foundAccount = findInvolvedAccount(
                        visibleAccounts,
                        decodedTransfer,
                    )

                    // Early exit if tx is not related to any of the visible accounts
                    if (!foundAccount) return

                    // check if tx is reverted
                    prepareTransactionStatus({ txId: transfer.meta.txID })

                    // User received NFT
                    if (foundAccount.origin === TransactionOrigin.TO) {
                        // inform user for successfull transfer
                        informUser({
                            txId: transfer.meta.txID,
                            originType: TransactionOrigin.TO,
                            toastType: ToastType.Success,
                            network,
                        })

                        // reload NFT collections from indexer
                        //todo
                    }

                    // User sent NFT
                    if (foundAccount.origin === TransactionOrigin.FROM) {
                        // we should wait for the indexer to index the transfer
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
                                network,
                            })

                            // reload NFT collections from indexer
                            //todo
                        }, 4000)
                    }
                }

                // ~ FUNGIBLE TOKEN TRANSFER
                if (decodedTransfer?.value) {
                    const foundAccount = findInvolvedAccount(
                        visibleAccounts,
                        decodedTransfer,
                    )

                    if (!foundAccount) return

                    // check if tx is reverted
                    prepareTransactionStatus({ txId: transfer.meta.txID })

                    // User received token
                    if (foundAccount.origin === TransactionOrigin.TO) {
                        info("TO : ", {
                            account: foundAccount.account?.address,
                            txOrigin: transfer.meta.txOrigin,
                            amount: decodedTransfer.value,
                        })

                        // inform user for successfull transfer
                        informUser({
                            txId: transfer.meta.txID,
                            originType: TransactionOrigin.FROM,
                            toastType: ToastType.Success,
                            network,
                            amount: decodedTransfer.value,
                        })

                        // reload balances
                        //todo
                    }

                    // User send token
                    if (foundAccount.origin === TransactionOrigin.FROM) {
                        info("FROM : ", {
                            account: foundAccount.account?.address,
                            txOrigin: transfer.meta.txOrigin,
                            amount: decodedTransfer.value,
                        })

                        // remove tx pending from redux
                        removeTransactionPending({ txId: transfer.meta.txID })

                        // inform usr for successfull transfer
                        informUser({
                            txId: transfer.meta.txID,
                            originType: TransactionOrigin.FROM,
                            toastType: ToastType.Success,
                            network,
                            amount: decodedTransfer.value,
                        })

                        // reload balances
                        //todo
                    }
                }
            } catch (e) {
                error(e)
            }
        },
        [
            prepareTransactionStatus,
            visibleAccounts,
            informUser,
            network,
            removeTransactionPending,
        ],
    )

    useWsUrlForTokens(network.currentUrl, onTokenMessage)

    // const { wsUrlForVET, isVetWSOpen } = useWsUrlForVET(
    //     currentAccount,
    //     network.currentUrl,
    // )

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
