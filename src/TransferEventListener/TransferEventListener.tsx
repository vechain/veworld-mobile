import React, { useCallback } from "react"
import {
    selectSelectedNetwork,
    selectVisibleAccounts,
    useAppSelector,
    fetchTransfersForBlock,
    EventTypeResponse,
} from "~Storage/Redux"
import { BloomUtils, debug, error } from "~Utils"
import { useInformUser, useStateReconciliaiton } from "./Hooks"
import {
    useFungibleTokenInfo,
    useNonFungibleTokenInfo,
    useTransactionStatus,
} from "~Hooks"
import { Beat } from "~Model"
import { useBeatWebsocket } from "./Hooks/useBeatWebsocket"
import {
    handleNFTTransfers,
    handleTokenTransfers,
    handleVETTransfers,
} from "./Helpers"

export const TransferEventListener: React.FC = () => {
    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const network = useAppSelector(selectSelectedNetwork)
    const { fetchData } = useFungibleTokenInfo()
    const { fetchData: fetchCollectionName } = useNonFungibleTokenInfo()
    const { removeTransactionPending } = useTransactionStatus()
    const { updateBalances, updateNFTs } = useStateReconciliaiton()
    const { forTokens, forNFTs } = useInformUser({ network })

    const onBeatMessage = useCallback(
        async (ev: WebSocketMessageEvent) => {
            try {
                const beat: Beat = JSON.parse(ev.data)

                // Filter out accounts we are not interested in
                const relevantAccounts = visibleAccounts.filter(acc =>
                    BloomUtils.testBloomForAddress(
                        beat.bloom,
                        beat.k,
                        acc.address,
                    ),
                )

                debug(
                    `Bloom filter: ${relevantAccounts.length} of ${visibleAccounts.length} accounts are relevant in block ${beat.number}`,
                )

                if (relevantAccounts.length === 0) return

                // Delay for 5 seconds to allow for the block to be indexed
                await new Promise(resolve => setTimeout(resolve, 5000))

                // Get transfers from indexer
                const transfers = await fetchTransfersForBlock(
                    beat.number,
                    relevantAccounts.slice(0, 20).map(acc => acc.address),
                    0,
                )

                debug(
                    `Found ${transfers.pagination.totalElements} transfers in block ${beat.number}`,
                )

                if (transfers.pagination.totalElements === 0) return

                // ~ NFT TRANSFER
                await Promise.all(
                    transfers.data
                        .filter(t => t.eventType === EventTypeResponse.NFT)
                        .map(async transfer => {
                            await handleNFTTransfers({
                                visibleAccounts: relevantAccounts,
                                transfer,
                                removeTransactionPending,
                                fetchCollectionName,
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
                                removeTransactionPending,
                                fetchData,
                                stateReconciliationAction: updateBalances,
                                informUser: forTokens,
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
                                removeTransactionPending,
                                stateReconciliationAction: updateBalances,
                                informUser: forTokens,
                            })
                        }),
                )
            } catch (e) {
                error(e)
            }
        },
        [
            visibleAccounts,
            removeTransactionPending,
            fetchCollectionName,
            updateNFTs,
            forNFTs,
            fetchData,
            updateBalances,
            forTokens,
        ],
    )

    useBeatWebsocket(network.currentUrl, onBeatMessage)

    return <></>
}
