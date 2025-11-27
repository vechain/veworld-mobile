import React, { useCallback, useMemo } from "react"
import { useReceiptProcessor } from "~Components/Providers/ReceiptProcessorProvider"
import { ERROR_EVENTS } from "~Constants"
import { components } from "~Generated/indexer/schema"
import { IndexerClient, useIndexerClient } from "~Hooks/useIndexerClient"
import { useStargateConfig } from "~Hooks/useStargateConfig"
import { useStargateInvalidation } from "~Hooks/useStargateInvalidation"
import { useThorClient } from "~Hooks/useThorClient"
import { Activity, Beat } from "~Model"
import { MAX_PAGE_SIZE } from "~Networking"
import {
    selectActivitiesWithoutFinality,
    selectBlackListedCollections,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectVisibleAccounts,
    updateBeat,
    useAppDispatch,
    useAppSelector,
    validateAndUpsertActivity,
} from "~Storage/Redux"
import { BloomUtils, error } from "~Utils"
import { handleStargateEvents } from "../StargateEventListener/Handlers/StargateEventHandlers"
import { handleNFTTransfers, handleTokenTransfers } from "./Handlers"
import { filterNFTTransferEvents, filterTransferEventsByType } from "./Helpers"
import { useStateReconciliation } from "./Hooks"
import { useBeatWebsocket } from "./Hooks/useBeatWebsocket"

const getAllTransfers = async (indexer: IndexerClient, accounts: string[], blockNumber: number) => {
    let results: components["schemas"]["IndexedTransferEvent"][] = []
    let page = 0
    while (true) {
        const transfers = await indexer
            .GET("/api/v1/transfers/forBlock", {
                params: {
                    query: {
                        addresses: accounts,
                        blockNumber: blockNumber,
                        direction: "ASC",
                        page,
                        size: MAX_PAGE_SIZE,
                    },
                },
            })
            .then(res => res.data!)

        results = results.concat(transfers.data)
        if (!transfers.pagination.hasNext || transfers.data.length === 0) break
        page++
    }

    return results
}

export const TransferEventListener: React.FC = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const visibleAccounts = useAppSelector(selectVisibleAccounts)

    const pendingActivities = useAppSelector(selectActivitiesWithoutFinality)

    const network = useAppSelector(selectSelectedNetwork)

    const thor = useThorClient()

    const { updateBalances, updateNFTs } = useStateReconciliation()

    const { invalidate: invalidateStargateData } = useStargateInvalidation()

    const blackListedCollections = useAppSelector(selectBlackListedCollections)

    const dispatch = useAppDispatch()

    const stargateConfig = useStargateConfig(network)

    const getReceiptProcessor = useReceiptProcessor()
    const genericReceiptProcessor = useMemo(() => getReceiptProcessor(["Generic"]), [getReceiptProcessor])

    const indexer = useIndexerClient(network)

    /**
     * For each pending activity, validates and upserts the updated activity if it's finalized on the blockchain
     */
    const updateActivities = useCallback(
        async (activities: Activity[]) => {
            const updatedActs: Activity[] = []
            for (const activity of activities) {
                const updated = await dispatch(validateAndUpsertActivity({ activity, thor })).unwrap()
                updatedActs.push(updated)
            }
            return updatedActs
        },
        [dispatch, thor],
    )

    const onBeatMessage = useCallback(
        async (beat: Beat) => {
            try {
                // Filter out accounts we are not interested in
                const relevantAccounts = visibleAccounts.filter(acc =>
                    BloomUtils.testBloomForAddress(beat.bloom, beat.k, acc.address),
                )

                // Update the pending transactions cache
                await updateActivities(pendingActivities)

                // Store the beat in the cache for use in other parts of the app
                dispatch(updateBeat(beat))

                // ~ STARGATE EVENTS (process regardless of token transfers)
                await handleStargateEvents({
                    beat,
                    network,
                    thor,
                    invalidateStargateData,
                    managedAddresses: visibleAccounts.map(acc => acc.address),
                    selectedAccountAddress: selectedAccount.address,
                    stargateConfig,
                    genericReceiptProcessor,
                })

                if (relevantAccounts.length === 0) return

                // Delay for 5 seconds to allow for the block to be indexed
                await new Promise(resolve => setTimeout(resolve, 5000))

                // Get transfers from indexer
                const transfers = await getAllTransfers(
                    indexer,
                    relevantAccounts.slice(0, 20).map(acc => acc.address),
                    beat.number,
                )

                if (transfers.length <= 0) return

                // ~ NFT TRANSFER
                const nftTransfers = filterNFTTransferEvents(transfers, blackListedCollections)
                await handleNFTTransfers({
                    selectedAccount,
                    visibleAccounts: relevantAccounts,
                    transfers: nftTransfers,
                    network: network,
                    updateNFTs,
                })

                // ~ FUNGIBLE TOKEN TRANSFER
                const tokenTransfers = filterTransferEventsByType(transfers, "FUNGIBLE_TOKEN")
                const vetTransfers = filterTransferEventsByType(transfers, "VET")

                handleTokenTransfers({
                    selectedAccount,
                    visibleAccounts: relevantAccounts,
                    transfers: tokenTransfers.concat(vetTransfers),
                    updateBalances,
                })

                // ~ STARGATE EVENTS (already processed above)
            } catch (e) {
                error(ERROR_EVENTS.TOKENS, e)
            }
        },
        [
            visibleAccounts,
            updateActivities,
            pendingActivities,
            dispatch,
            network,
            thor,
            invalidateStargateData,
            selectedAccount,
            stargateConfig,
            genericReceiptProcessor,
            indexer,
            blackListedCollections,
            updateNFTs,
            updateBalances,
        ],
    )

    useBeatWebsocket(network.currentUrl, onBeatMessage)

    return <></>
}
