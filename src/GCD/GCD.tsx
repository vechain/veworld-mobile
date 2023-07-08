import React, { useCallback } from "react"
import {
    selectSelectedNetwork,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { TransactionUtils, error } from "~Utils"
import {
    useInformUser,
    useStateReconciliaiton,
    useWsUrlForTokens,
    useWsUrlForVET,
} from "./Hooks"
import {
    useFungibleTokenInfo,
    useNonFungibleTokenInfo,
    useTransactionStatus,
} from "~Hooks"
import { TransferEvent, VetTransferEvent } from "~Model"
import {
    handleNFTTransfers,
    handleTokenTransfers,
    handleVETTransfers,
} from "./Helpers"

const GCD: React.FC = () => {
    const visibleAccounts = useAppSelector(selectVisibleAccounts)
    const network = useAppSelector(selectSelectedNetwork)
    const { fetchData } = useFungibleTokenInfo()
    const { fetchData: fetchCollectionName } = useNonFungibleTokenInfo()
    const { removeTransactionPending } = useTransactionStatus()
    const { stateReconciliationAction } = useStateReconciliaiton()
    const { forTokens, forNFTs } = useInformUser({ network })

    const onTokenMessage = useCallback(
        async (ev: WebSocketMessageEvent) => {
            try {
                const transfer = JSON.parse(ev.data) as TransferEvent

                const decodedTransfer =
                    TransactionUtils.decodeTransferEvent(transfer)

                // ~ NFT TRANSFER
                if (decodedTransfer?.tokenId) {
                    await handleNFTTransfers({
                        visibleAccounts,
                        decodedTransfer,
                        transfer,
                        removeTransactionPending,
                        fetchCollectionName,
                        informUser: forNFTs,
                    })
                }

                // ~ FUNGIBLE TOKEN TRANSFER
                if (decodedTransfer?.value) {
                    await handleTokenTransfers({
                        visibleAccounts,
                        decodedTransfer,
                        transfer,
                        removeTransactionPending,
                        fetchData,
                        stateReconciliationAction,
                        informUser: forTokens,
                    })
                }
            } catch (e) {
                error(e)
            }
        },
        [
            visibleAccounts,
            removeTransactionPending,
            fetchCollectionName,
            forNFTs,
            fetchData,
            stateReconciliationAction,
            forTokens,
        ],
    )

    useWsUrlForTokens(network.currentUrl, onTokenMessage)

    const onVETMessage = useCallback(
        async (ev: WebSocketMessageEvent) => {
            const transfer = JSON.parse(ev.data) as VetTransferEvent

            // ~  VET TRANSFERS
            handleVETTransfers({
                transfer,
                visibleAccounts,
                removeTransactionPending,
                stateReconciliationAction,
                informUser: forTokens,
            })
        },
        [
            visibleAccounts,
            removeTransactionPending,
            stateReconciliationAction,
            forTokens,
        ],
    )

    useWsUrlForVET(network.currentUrl, onVETMessage)

    return <></>
}

export default GCD
