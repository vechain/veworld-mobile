import React, { useCallback } from "react"
import {
    selectActivitiesWithoutFinality,
    selectBlackListedCollections,
    selectSelectedNetwork,
    selectVisibleAccounts,
    updateBeat,
    useAppDispatch,
    useAppSelector,
    validateAndUpsertActivity,
} from "~Storage/Redux"
import { BloomUtils, debug, error } from "~Utils"
import { useInformUser, useStateReconciliation } from "./Hooks"
import { useFungibleTokenInfo } from "~Hooks"
import { Activity, Beat } from "~Model"
import { useBeatWebsocket } from "./Hooks/useBeatWebsocket"
import {
    fetchTransfersForBlock,
    handleNFTTransfers,
    handleTokenTransfers,
    handleVETTransfers,
} from "./Helpers"
import { EventTypeResponse } from "~Networking"
import { useThor } from "~Components"

export const TransferEventListener: React.FC = () => {
    const visibleAccounts = useAppSelector(selectVisibleAccounts)

    const pendingActivities = useAppSelector(selectActivitiesWithoutFinality)

    const network = useAppSelector(selectSelectedNetwork)

    const thor = useThor()

    const { fetchData } = useFungibleTokenInfo()

    const { updateBalances, updateNFTs } = useStateReconciliation()

    const { forTokens, forNFTs } = useInformUser({ network })

    const blackListedCollections = useAppSelector(selectBlackListedCollections)

    const dispatch = useAppDispatch()

    /**
     * For each pending activity, validates and upserts the updated activity if it's finalized on the blockchain
     */
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

    const onBeatMessage = useCallback(
        async (beat: Beat) => {
            try {
                // Filter out accounts we are not interested in
                const relevantAccounts = visibleAccounts.filter(acc =>
                    BloomUtils.testBloomForAddress(
                        beat.bloom,
                        beat.k,
                        acc.address,
                    ),
                )

                // debug(
                //     `Bloom filter: ${relevantAccounts.length} of ${visibleAccounts.length} accounts are relevant in block ${beat.number}`,
                // )

                // Update the pending transactions cache
                await updateActivities(pendingActivities)

                // Store the beat in the cache for use in other parts of the app
                dispatch(updateBeat(beat))

                if (relevantAccounts.length === 0) return

                // Delay for 5 seconds to allow for the block to be indexed
                await new Promise(resolve => setTimeout(resolve, 5000))

                // Get transfers from indexer
                const transfers = await fetchTransfersForBlock(
                    beat.number,
                    relevantAccounts.slice(0, 20).map(acc => acc.address), // Limit to first 20 accounts
                    0,
                    network.type,
                )

                debug(
                    `Found ${transfers.pagination.totalElements} transfers in block ${beat.number}`,
                )

                if (transfers.pagination.totalElements === 0) return

                // ~ NFT TRANSFER
                await Promise.all(
                    transfers.data
                        .filter(
                            t =>
                                t.eventType === EventTypeResponse.NFT &&
                                !blackListedCollections
                                    .map(c => c.address)
                                    .includes(t.tokenAddress),
                        )
                        .map(async transfer => {
                            await handleNFTTransfers({
                                visibleAccounts: relevantAccounts,
                                transfer,
                                network: network,
                                thorClient: thor,
                                stateReconciliationAction: updateNFTs,
                                informUser: forNFTs,
                            })
                        }),
                )

                // ~ FUNGIBLE TOKEN TRANSFER
                await Promise.all(
                    transfers.data
                        .filter(
                            t =>
                                t.eventType ===
                                EventTypeResponse.FUNGIBLE_TOKEN,
                        )
                        .map(async transfer => {
                            await handleTokenTransfers({
                                visibleAccounts: relevantAccounts,
                                transfer,
                                network,
                                thorClient: thor,
                                fetchData,
                                stateReconciliationAction: updateBalances,
                                informUser: forTokens,
                                dispatch,
                            })
                        }),
                )

                // ~  VET TRANSFERS
                await Promise.all(
                    transfers.data
                        .filter(t => t.eventType === EventTypeResponse.VET)
                        .map(async transfer => {
                            handleVETTransfers({
                                transfer,
                                visibleAccounts,
                                stateReconciliationAction: updateBalances,
                                informUser: forTokens,
                            })
                        }),
                )
            } catch (e) {
                error("onBeatMessage", e)
            }
        },
        [
            visibleAccounts,
            updateActivities,
            pendingActivities,
            dispatch,
            network,
            blackListedCollections,
            updateNFTs,
            forNFTs,
            thor,
            fetchData,
            updateBalances,
            forTokens,
        ],
    )

    useBeatWebsocket(network.currentUrl, onBeatMessage)

    return <></>
}
