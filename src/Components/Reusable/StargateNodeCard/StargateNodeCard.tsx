import React from "react"
import { useNFTMetadata } from "~Hooks/useNFTMetadata"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useThorClient } from "~Hooks/useThorClient"
import { useStargateConfig } from "~Hooks/useStargateConfig"
import { useQuery } from "@tanstack/react-query"
import { getTokenURI } from "~Networking/NFT"
import { StargateImage } from "~Screens/Flows/App/BalanceScreen/Components/Staking/StargateImage"
import { BaseText, BaseView } from "~Components/Base"
import { getTokenLevelName, TokenLevelId } from "~Utils/StargateUtils/StargateUtils"
import { useNodesByTokenId } from "~Hooks/Staking"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks/useTheme"
import { useI18nContext } from "~i18n/i18n-react"

type Props = {
    tokenId: string
    blockNumber?: number
}

export const StargateNodeCard = ({ tokenId, blockNumber }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { fetchMetadata } = useNFTMetadata()
    const { LL } = useI18nContext()

    const network = useAppSelector(selectSelectedNetwork)

    const thor = useThorClient()

    const stargateConfig = useStargateConfig(network)

    const { data: nodeInfo } = useNodesByTokenId(tokenId)

    const { data: tokenURI } = useQuery({
        queryKey: ["StargateTokenURI", network.type, nodeInfo?.nodeId],
        queryFn: () =>
            getTokenURI(nodeInfo?.nodeId ?? "", stargateConfig.STARGATE_NFT_CONTRACT_ADDRESS!, thor, blockNumber),
        enabled: Boolean(stargateConfig.STARGATE_NFT_CONTRACT_ADDRESS) && !!nodeInfo,
    })

    const { data } = useQuery({
        queryKey: ["StargateNftMetadata", network.type, nodeInfo?.nodeId],
        queryFn: () => fetchMetadata(tokenURI!),
        enabled: Boolean(tokenURI),
    })

    return (
        <BaseView flexDirection="row" alignItems="center" gap={16} px={16} py={12}>
            <StargateImage
                uri={data?.image}
                width={40}
                height={40}
                borderRadius={4}
                containerStyle={styles.imageContainer}
            />
            <BaseView flexDirection="column" gap={4}>
                <BaseText typographyFont="bodySemiBold">
                    {LL.VALIDATOR_DELEGATION_EXITED_NODE_NAME({
                        nodeLevel: getTokenLevelName(
                            (nodeInfo?.nodeLevel ? (nodeInfo.nodeLevel as TokenLevelId) : undefined) ??
                                TokenLevelId.None,
                        ),
                    })}
                </BaseText>
                <BaseText typographyFont="captionMedium">
                    {LL.VALIDATOR_DELEGATION_EXITED_NODE_NAME_TOKEN_ID({
                        tokenId: nodeInfo?.nodeId ?? "",
                    })}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        imageContainer: {
            width: 40,
            height: 40,
        },
    })
