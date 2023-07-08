import { useCallback } from "react"
import { Linking } from "react-native"
import { defaultMainNetwork } from "~Constants"
import { Network } from "~Model"

export const useInformUser = ({ network }: { network: Network }) => {
    const forTokens = useCallback(
        async (params: { accountAddress: string; txId?: string }) => {
            // Outgoing transactions
            if (params.txId) {
                Linking.openURL(
                    `${
                        network.explorerUrl ?? defaultMainNetwork.explorerUrl
                    }/transactions/${params.txId}`,
                )
            } else {
                // received token/VET
                // todo.vas -> switch currrent account to accountAddress -> IF NOT, SWITCH TO THAT ACCOUNT
            }
        },
        [network.explorerUrl],
    )

    const forNFTs = useCallback(
        async (params: { accountAddress: string; txId?: string }) => {
            if (params?.txId) {
                // Outgoing transactions
                Linking.openURL(
                    `${
                        network.explorerUrl ?? defaultMainNetwork.explorerUrl
                    }/transactions/${params.txId}`,
                )
            } else {
                // 1. User received NFT
                // todo.vas -> GO TO NFT TAB -> switch currrent account to accountAddress -> REFRESH NFTS
            }
        },
        [network.explorerUrl],
    )

    return { forTokens, forNFTs }
}
