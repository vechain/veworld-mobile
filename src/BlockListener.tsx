import React, { useCallback, useEffect, useMemo } from "react"
import useWebSocket from "react-use-websocket"
import {
    AddressUtils,
    BloomUtils,
    URLUtils,
    // VET,
    debug,
    error,
    info,
    useCounter,
    useToastNotification,
    warn,
} from "~Common"
import { useThor } from "~Components"
import { Account, Activity, FungibleTokenWithBalance } from "~Model"
import {
    selectActivitiesWithoutFinality,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectTokensWithBalances,
    selectVisibleAccounts,
    updateAccountBalances,
    updateNodeError,
    useAppDispatch,
    useAppSelector,
    validateAndUpsertActivity,
} from "~Storage/Redux"
// import { useI18nContext } from "~i18n"

/**
 * The beat object received at each wss message from the node
 * @param number - The block number
 * @param id - The block id
 * @param parentID - The parent block id
 * @param timestamp - The block timestamp
 * @param gasLimit - The block gas limit
 * @param bloom - The block bloom filter
 * @param k - The block bloom filter k value
 * @param txsFeatures - The block txs features
 * @param obsolete - Whether the block is obsolete
 */
export interface Beat {
    number: number
    id: string
    parentID: string
    timestamp: number
    gasLimit: number
    bloom: string
    k: number
    txsFeatures?: number
    obsolete: boolean
}

const BlockListener: React.FC = () => {
    // const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const allTokensWithBalance = useAppSelector(selectTokensWithBalances)
    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const currentAccount = useAppSelector(selectSelectedAccount)
    const thor = useThor()
    const pendingActivities = useAppSelector(selectActivitiesWithoutFinality)
    const {
        count: counter,
        increment: incrementCounter,
        reset: resetCounter,
    } = useCounter()
    const { showTransactionReverted } = useToastNotification()

    useEffect(() => {
        resetCounter()
    }, [network.currentUrl, resetCounter])

    const beatUrl = useMemo(
        () =>
            URLUtils.toWebsocketURL(network.currentUrl, "/subscriptions/beat2"),
        [network],
    )

    const updateActivities = useCallback(
        async (activities: Activity[]) => {
            const updatedActs: Activity[] = []
            for (const act of activities) {
                const updated = await dispatch(
                    validateAndUpsertActivity({ activity: act, thor }),
                ).unwrap()
                updatedActs.push(updated)
            }
            return updatedActs
        },
        [dispatch, thor],
    )

    const onMessage = async (ev: WebSocketMessageEvent) => {
        dispatch(updateNodeError(false))
        const beat: Beat = JSON.parse(ev.data)
        debug(`Got a new beat (${beatUrl}). Block number:  ${beat.number}`)
        await handleBeat(beat, allTokensWithBalance, visibleAccounts)
    }

    useWebSocket(beatUrl, {
        onMessage,
        onOpen: ev => {
            info("Beat WS open on: ", ev.currentTarget)
            dispatch(updateNodeError(false))
        },
        onError: ev => {
            error(ev)
            //If we've seen at least 3 errors, then we should show a node error on the dashboard
            if (counter > 3) {
                warn("Troubles connecting to the node.")
                dispatch(updateNodeError(true))
            } else {
                incrementCounter()
            }
        },
        onClose: ev => info(ev),
        shouldReconnect: closeEvent => {
            const log = closeEvent.wasClean ? info : warn
            log(
                "Will attempt to reconnect web socket after closure",
                closeEvent,
            )

            //Attempt to use another node if the current one has issues
            //Not doing async because the result should not affect this function
            // if (!closeEvent.wasClean && network.defaultNet) {
            //     dispatch(changeSelectedNetwork(network.id))
            //         .then(e => info(e))
            //         .catch(e => warn(e))
            // }
            return true
        },
        retryOnError: true,
        reconnectAttempts: 10_000,
        reconnectInterval: 1_000,
    })

    const handleBeat = async (
        beat: Beat,
        tokens: FungibleTokenWithBalance[],
        accounts: Account[],
    ) => {
        //Update the pending transaction cache, check for reverted
        const updatedActivities = await updateActivities(pendingActivities)
        for (const updatedAct of updatedActivities) {
            if (updatedAct.txReceipt?.reverted) {
                showTransactionReverted(updatedAct.id)
            }
        }

        // Filter out accounts we are not interested in
        const relevantAccounts = accounts.filter(acc =>
            BloomUtils.testBloomForAddress(beat.bloom, beat.k, acc.address),
        )
        debug({ relevantAccounts })
        if (relevantAccounts.length === 0) return

        // Filter out tokens we are not interested in
        // const relevantTokens = tokens.filter(
        //     tkn =>
        //         tkn.address !== VET.symbol &&
        //         BloomUtils.testBloomForAddress(beat.bloom, beat.k, tkn.address),
        // )

        // Detect transfer events for all accounts and alert the user
        // await attemptAlertOnTransfer(beat.number, relevantAccounts)

        // Detect token transfer events for all accounts and alert the user
        // for (const acct of relevantAccounts) {
        // const relevantTokensForAcct = relevantTokens.filter(t =>
        //     AddressUtils.compareAddresses(
        //         t.balance.accountAddress,
        //         acct.address,
        //     ),
        // )
        // if (relevantTokensForAcct.length > 0)
        //     await attemptAlertOnTokenTransfer(
        //         beat.number,
        //         relevantTokensForAcct,
        //     )
        // }

        // If the selected account is relevant update the balances
        if (
            currentAccount &&
            relevantAccounts.some(acc =>
                AddressUtils.compareAddresses(
                    acc.address,
                    currentAccount.address,
                ),
            )
        ) {
            await dispatch(updateAccountBalances(thor, currentAccount.address))
        }
    }

    // const attemptAlertOnTransfer = async (
    //     blockNumber: number,
    //     relevantAccounts: Account[],
    // ) => {
    //     if (relevantAccounts.length === 0) return

    //     const relevantAddresses = relevantAccounts.map(acc => acc.address)

    //     const criteria = relevantAddresses.reduce<
    //         Connex.Thor.Filter.Criteria<"transfer">[]
    //     >((prev, cur) => {
    //         prev.push({ sender: cur }, { recipient: cur })
    //         return prev
    //     }, [])

    //     if (!thor) throw Error("Thor undefined")
    //     const transfers = await thor
    //         .filter("transfer", criteria)
    //         .cache(relevantAddresses)
    //         .range({ unit: "block", from: blockNumber, to: blockNumber })
    //         .apply(0, 5)

    //     // send toast notification for each transfer
    //     transfers.forEach(tran => showFoundTokenTransfer(VET, tran.amount))
    // }

    // const processedTransactionIds = new Set<string>()

    // const attemptAlertOnTokenTransfer = async (
    //     blockNumber: number,
    //     relevantTokens: FungibleTokenWithBalance[],
    // ) => {
    //     if (relevantTokens.length === 0) return

    //     if (!thor) return warn("Thor not initialized")

    //     for (const token of relevantTokens) {
    //         const tokenTransfers = await TransfersService.getTransfers({
    //             thor,
    //             token,
    //             accountAddress: token.balance.accountAddress,
    //             fromBlock: blockNumber,
    //             toBlock: blockNumber,
    //             offset: 0,
    //             size: 5,
    //         })

    //         tokenTransfers.forEach(evt => {
    //             if (!processedTransactionIds.has(evt.transactionId)) {
    //                 toast.success(
    //                     LL.NOTIFICATION_found_token_transfer({
    //                         token: token.symbol.toUpperCase(),
    //                         amount: humanNumber(
    //                             scaleNumberDown(
    //                                 evt.amount,
    //                                 token.decimals,
    //                                 ROUND_DECIMAL_DEFAULT,
    //                             ),
    //                             evt.amount,
    //                             token.symbol,
    //                         ),
    //                     }),
    //                 )
    //                 processedTransactionIds.add(evt.transactionId)
    //             }
    //         })
    //     }
    // }

    return <></>
}

export default BlockListener
