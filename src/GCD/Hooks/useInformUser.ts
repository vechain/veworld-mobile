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
                // todo.vas -> https://github.com/vechainfoundation/veworld-mobile/issues/806
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
                // todo.vas -> https://github.com/vechainfoundation/veworld-mobile/issues/806
            }
        },
        [network.explorerUrl],
    )

    return { forTokens, forNFTs }
}
