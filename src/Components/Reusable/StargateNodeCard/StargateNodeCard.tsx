import React from "react"
import { NodeInfo } from "~Model"
import { useNFTMetadata } from "~Hooks/useNFTMetadata"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useThorClient } from "~Hooks/useThorClient"
import { useStargateConfig } from "~Hooks/useStargateConfig"
import { useQuery } from "@tanstack/react-query"
import { getTokenURI } from "~Networking/NFT"
import { StargateImage } from "~Screens/Flows/App/BalanceScreen/Components/Staking/StargateImage"
import { BaseText, BaseView } from "~Components/Base"
import { getTokenLevelName, TokenLevelId } from "~Utils/StargateUtils/StargateUtils"

type Props = {
    item: NodeInfo
}

export const StargateNodeCard = ({ item }: Props) => {
    const { fetchMetadata } = useNFTMetadata()

    const network = useAppSelector(selectSelectedNetwork)

    const thor = useThorClient()

    const stargateConfig = useStargateConfig(network)

    const { data: tokenURI } = useQuery({
        queryKey: ["StargateTokenURI", network.type, item.nodeId],
        queryFn: () => getTokenURI(item.nodeId, stargateConfig.STARGATE_NFT_CONTRACT_ADDRESS!, thor),
        enabled: Boolean(stargateConfig.STARGATE_NFT_CONTRACT_ADDRESS),
    })

    const { data } = useQuery({
        queryKey: ["StargateNftMetadata", network.type, item.nodeId],
        queryFn: () => fetchMetadata(tokenURI!),
        enabled: Boolean(tokenURI),
    })

    return (
        <BaseView flexDirection="row" alignItems="center" gap={16} px={16} py={12}>
            <StargateImage uri={data?.image} width={40} height={40} borderRadius={4} />
            <BaseView flexDirection="column" gap={4}>
                <BaseText typographyFont="bodySemiBold">
                    {getTokenLevelName(
                        (item.nodeLevel ? (item.nodeLevel as TokenLevelId) : undefined) ?? TokenLevelId.None,
                    )}
                </BaseText>
                <BaseText typographyFont="captionMedium">{"Token ID: " + item.nodeId}</BaseText>
            </BaseView>
        </BaseView>
    )
}
