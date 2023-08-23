import { useNavigation } from "@react-navigation/native"
import { useCallback } from "react"
import { Linking } from "react-native"
import { defaultMainNetwork } from "~Constants"
import { Network } from "~Model"
import { Routes } from "~Navigation"
import { setSelectedAccount, useAppDispatch } from "~Storage/Redux"

export const useInformUser = ({ network }: { network: Network }) => {
    const nav = useNavigation()
    const disptach = useAppDispatch()

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
                nav.navigate(Routes.HOME)
                disptach(
                    setSelectedAccount({
                        address: params.accountAddress,
                    }),
                )
            }
        },
        [disptach, nav, network.explorerUrl],
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
                nav.navigate(Routes.NFTS)
                disptach(
                    setSelectedAccount({
                        address: params.accountAddress,
                    }),
                )
            }
        },
        [disptach, nav, network.explorerUrl],
    )

    return { forTokens, forNFTs }
}
