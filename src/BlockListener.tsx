import React, { useCallback, useEffect, useMemo, useState } from "react"
import useWebSocket from "react-use-websocket"
import { error, info, warn } from "~Common"
import { VET } from "~Common/Constant/Token"
import { useCounter, useToastNotification } from "~Common/Hooks"
import { AddressUtils, BloomUtils, TransfersUtils, URLUtils } from "~Utils"

import { useThor } from "~Components"
import {
    Account,
    Activity,
    ActivityStatus,
    FungibleTokenWithBalance,
} from "~Model"
import {
    selectActivitiesWithoutFinality,
    selectSelectedNetwork,
    selectAllAccountsTokensWithBalances,
    selectVisibleAccounts,
    updateAccountBalances,
    updateNodeError,
    useAppDispatch,
    useAppSelector,
    validateAndUpsertActivity,
    addIncomingTransfer,
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
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const allTokensWithBalance = useAppSelector(
        selectAllAccountsTokensWithBalances,
    )
    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const thor = useThor()
    const pendingActivities = useAppSelector(selectActivitiesWithoutFinality)
    const {
        count: counter,
        increment: incrementCounter,
        reset: resetCounter,
    } = useCounter()
    const { showTransactionReverted, showFoundTokenTransfer } =
        useToastNotification()

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
            for (const activity of activities) {
                const updated = await dispatch(
                    validateAndUpsertActivity({ activity, thor }),
                ).unwrap()
                updatedActs.push(updated)
            }
            return updatedActs
        },
        [dispatch, thor],
    )

    const onOpen = () => {
        info("Beat WS open on: ", beatUrl)
        dispatch(updateNodeError(false))
    }

    const onMessage = async (ev: WebSocketMessageEvent) => {
        dispatch(updateNodeError(false))
        const beat: Beat = JSON.parse(ev.data)
        await handleBeat(beat, allTokensWithBalance, visibleAccounts)
    }

    const onError = (ev: WebSocketErrorEvent) => {
        error("Error on beat WS: ", ev)
        //If we've seen at least 3 errors, then we should show a node error on the dashboard
        if (counter > 3) {
            warn("Troubles connecting to the node.")
            dispatch(updateNodeError(true))
        } else {
            incrementCounter()
        }
    }

    const onClose = (ev: WebSocketCloseEvent) => {
        info("wss closed ", ev)
    }

    const shouldReconnect = useCallback((closeEvent: WebSocketCloseEvent) => {
        const log = closeEvent.isTrusted ? info : warn
        log("Will attempt to reconnect web socket after closure", closeEvent)

        // TODO: //Attempt to use another node if the current one has issues
        //Not doing async because the result should not affect this function
        // if (!closeEvent.wasClean && network.defaultNet) {
        //     dispatch(changeSelectedNetwork(network.id))
        //         .then(e => info(e))
        //         .catch(e => warn(e))
        // }
        return true
    }, [])

    useWebSocket(beatUrl, {
        onOpen,
        onMessage,
        onError,
        onClose,
        shouldReconnect,
        retryOnError: true,
        reconnectAttempts: 1000,
        reconnectInterval: 3000,
    })

    const handleBeat = async (
        beat: Beat,
        tokens: FungibleTokenWithBalance[],
        accounts: Account[],
    ) => {
        //Update the pending transaction cache, check for reverted
        const updatedActivities = await updateActivities(pendingActivities)
        for (const updatedAct of updatedActivities) {
            if (updatedAct.status === ActivityStatus.REVERTED) {
                showTransactionReverted(updatedAct.id)
            }
        }

        // Filter out accounts we are not interested in
        const relevantAccounts = accounts.filter(acc =>
            BloomUtils.testBloomForAddress(beat.bloom, beat.k, acc.address),
        )
        if (relevantAccounts.length === 0) return

        // Detect transfer events for all accounts and alert the user
        await attemptAlertOnVetTransfer(beat.number, relevantAccounts)

        // Filter out tokens we are not interested in (the one we are not tracking)
        const relevantTokens = tokens.filter(
            tkn =>
                tkn.address !== VET.symbol &&
                BloomUtils.testBloomForAddress(beat.bloom, beat.k, tkn.address),
        )

        // Detect token transfer events for all accounts and alert the user
        for (const acct of relevantAccounts) {
            const relevantTokensForAcct = relevantTokens.filter(t =>
                AddressUtils.compareAddresses(
                    t.balance.accountAddress,
                    acct.address,
                ),
            )
            if (relevantTokensForAcct.length > 0)
                await attemptAlertOnTokenTransfer(
                    beat.number,
                    relevantTokensForAcct,
                )
        }

        // Update balances of all relevant accounts
        for (const acct of relevantAccounts) {
            await dispatch(updateAccountBalances(thor, acct.address))
        }
    }

    const attemptAlertOnVetTransfer = async (
        blockNumber: number,
        relevantAccounts: Account[],
    ) => {
        if (relevantAccounts.length === 0) return

        const relevantAddresses = relevantAccounts.map(acc => acc.address)

        const criteria = relevantAddresses.reduce<
            Connex.Thor.Filter.Criteria<"transfer">[]
        >((prev, cur) => {
            prev.push({ sender: cur }, { recipient: cur })
            return prev
        }, [])

        if (!thor) throw Error("Thor undefined")
        const transfers = await thor
            .filter("transfer", criteria)
            .cache(relevantAddresses)
            .range({ unit: "block", from: blockNumber, to: blockNumber })
            .apply(0, 5)

        // send toast notification for each transfer
        transfers.forEach(transfer => {
            showFoundTokenTransfer(VET, transfer.amount)

            dispatch(
                addIncomingTransfer(
                    transfer.meta,
                    transfer.amount,
                    transfer.recipient,
                    transfer.sender,
                    VET.address,
                    thor,
                ),
            )
        })
    }

    const [processedTransactionIds, setProcessedTransactionIds] = useState<
        Set<string>
    >(new Set<string>())

    /**
     *  Check for token transfers in a block for the given tokens and alert the user with a toast notification
     * @param blockNumber   The block number to check for transfers
     * @param relevantTokens  The tokens to check for transfers
     * @returns
     */
    const attemptAlertOnTokenTransfer = async (
        blockNumber: number,
        relevantTokens: FungibleTokenWithBalance[],
    ) => {
        if (relevantTokens.length === 0) return

        if (!thor) return warn("Thor not initialized")

        for (const token of relevantTokens) {
            const tokenTransfers = await TransfersUtils.getTransfers({
                thor,
                token,
                accountAddress: token.balance.accountAddress,
                fromBlock: blockNumber,
                toBlock: blockNumber,
                offset: 0,
                size: 5,
            })

            tokenTransfers.forEach(evt => {
                if (!processedTransactionIds.has(evt.transactionId)) {
                    showFoundTokenTransfer(token, evt.amount)
                    setProcessedTransactionIds(
                        prev => new Set([...prev, evt.transactionId]),
                    )

                    dispatch(
                        addIncomingTransfer(
                            evt.meta,
                            evt.amount,
                            evt.recipient,
                            evt.sender,
                            evt.token.address,
                            thor,
                        ),
                    )
                }
            })
        }
    }

    return <></>
}

export default BlockListener
