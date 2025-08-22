import React, { useCallback } from "react"
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
import { useInformUser, useStateReconciliation } from "./Hooks"
import { useFungibleTokenInfo } from "~Hooks"
import { Activity, Beat } from "~Model"
import { useBeatWebsocket } from "./Hooks/useBeatWebsocket"
import { EventTypeResponse } from "~Networking"
import { fetchTransfersForBlock } from "~Networking/Transfers"
import { filterNFTTransferEvents, filterTransferEventsByType } from "./Helpers"
import { handleNFTTransfers, handleTokenTransfers, handleVETTransfers } from "./Handlers"
import { handleNodeDelegatedEvent } from "../StargateEventListener/Handlers/StargateEventHandlers"
import { useFetchingStargate } from "../StargateEventListener/Hooks/useFetchingStargate"
import { ERROR_EVENTS } from "~Constants"
import { useThorClient } from "~Hooks/useThorClient"

export const TransferEventListener: React.FC = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const visibleAccounts = useAppSelector(selectVisibleAccounts)

    const pendingActivities = useAppSelector(selectActivitiesWithoutFinality)

    const network = useAppSelector(selectSelectedNetwork)

    const thor = useThorClient()

    const { fetchData } = useFungibleTokenInfo()

    const { updateBalances, updateNFTs } = useStateReconciliation()

    const { forTokens, forNFTs } = useInformUser({ network })

    const { refetchStargateData } = useFetchingStargate()

    const blackListedCollections = useAppSelector(selectBlackListedCollections)

    const dispatch = useAppDispatch()

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
                await handleNodeDelegatedEvent({
                    beat,
                    network,
                    thor,
                    refetchStargateData,
                    managedAddresses: visibleAccounts.map(acc => acc.address),
                    selectedAccountAddress: selectedAccount.address,
                })

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

                if (transfers.data.length <= 0) return

                // ~ NFT TRANSFER
                const nftTransfers = filterNFTTransferEvents(transfers.data, blackListedCollections)
                await handleNFTTransfers({
                    selectedAccount,
                    visibleAccounts: relevantAccounts,
                    transfers: nftTransfers,
                    network: network,
                    thorClient: thor,
                    updateNFTs,
                    informUser: forNFTs,
                })

                // ~ FUNGIBLE TOKEN TRANSFER
                const tokenTransfers = filterTransferEventsByType(transfers.data, EventTypeResponse.FUNGIBLE_TOKEN)

                await handleTokenTransfers({
                    selectedAccount,
                    visibleAccounts: relevantAccounts,
                    transfers: tokenTransfers,
                    fetchData,
                    updateBalances,
                    informUser: forTokens,
                })

                // ~  VET TRANSFERS
                const vetTransfers = filterTransferEventsByType(transfers.data, EventTypeResponse.VET)
                handleVETTransfers({
                    selectedAccount,
                    transfers: vetTransfers,
                    visibleAccounts,
                    updateBalances,
                    informUser: forTokens,
                })

                // ~ STARGATE EVENTS (already processed above)
            } catch (e) {
                error(ERROR_EVENTS.TOKENS, e)
            }
        },
        [
            selectedAccount,
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
            refetchStargateData,
        ],
    )

    useBeatWebsocket(network.currentUrl, onBeatMessage)

    return <></>
}
