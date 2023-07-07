import React, { useCallback } from "react"
import {
    selectSelectedNetwork,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { TransactionUtils, error } from "~Utils"
import {
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
    const network = useAppSelector(selectSelectedNetwork)
    const visibleAccounts = useAppSelector(selectVisibleAccounts)

    const { fetchData } = useFungibleTokenInfo()
    const { fetchData: fetchCollectionName } = useNonFungibleTokenInfo()
    const { removeTransactionPending, checkIfReverted } = useTransactionStatus()
    const { updateBalances, updateNFTs } = useStateReconciliaiton()

    const onTokenMessage = useCallback(
        async (ev: WebSocketMessageEvent) => {
            try {
                const transfer = JSON.parse(ev.data) as TransferEvent

                const decodedTransfer =
                    TransactionUtils.decodeTransferEvent(transfer)

                // ~ NFT TRANSFER
                if (decodedTransfer?.tokenId) {
                    handleNFTTransfers({
                        visibleAccounts,
                        decodedTransfer,
                        transfer,
                        removeTransactionPending,
                        checkIfReverted,
                        network,
                        fetchCollectionName,
                        reconciliationAction: updateNFTs,
                    })
                }

                // ~ FUNGIBLE TOKEN TRANSFER
                if (decodedTransfer?.value) {
                    handleTokenTransfers({
                        visibleAccounts,
                        decodedTransfer,
                        transfer,
                        removeTransactionPending,
                        checkIfReverted,
                        network,
                        fetchData,
                        reconciliationAction: updateBalances,
                    })
                }
            } catch (e) {
                error(e)
            }
        },
        [
            visibleAccounts,
            removeTransactionPending,
            checkIfReverted,
            network,
            fetchCollectionName,
            updateNFTs,
            fetchData,
            updateBalances,
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
                checkIfReverted,
                network,
                reconciliationAction: updateBalances,
            })
        },
        [
            checkIfReverted,
            network,
            removeTransactionPending,
            visibleAccounts,
            updateBalances,
        ],
    )

    useWsUrlForVET(network.currentUrl, onVETMessage)

    return <></>
}

export default GCD
