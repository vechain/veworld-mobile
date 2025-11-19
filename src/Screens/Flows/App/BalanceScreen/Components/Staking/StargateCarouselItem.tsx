import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseCard, BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS, ColorThemeType, VET, VTHO } from "~Constants"
import { useFormatFiat, useTheme, useThemedStyles } from "~Hooks"
import { useNFTMetadata } from "~Hooks/useNFTMetadata"
import { useStargateClaimableRewards } from "~Hooks/useStargateClaimableRewards"
import { useStargateConfig } from "~Hooks/useStargateConfig"
import { useThorClient } from "~Hooks/useThorClient"
import { useI18nContext } from "~i18n"
import { NodeInfo } from "~Model"
import { getTokenURI } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { formatDisplayNumber } from "~Utils/StandardizedFormatting"
import { getTokenLevelName, TokenLevelId } from "~Utils/StargateUtils"
import { StargateImage } from "./StargateImage"

type Props = {
    item: NodeInfo
}

const RowItem = ({ label, value, icon, testID }: { label: string; value: string; icon: string; testID: string }) => {
    const theme = useTheme()
    const { formatLocale } = useFormatFiat()

    const formattedValue = useMemo(() => {
        const humanBalance = BigNutils(value).toHuman(VET.decimals).toString

        return formatDisplayNumber(humanBalance, { locale: formatLocale })
    }, [value, formatLocale])

    return (
        <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" py={2} testID={testID}>
            <BaseText color={theme.colors.assetDetailsCard.text} typographyFont="captionMedium">
                {label}
            </BaseText>
            <BaseView gap={8} flexDirection="row">
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800} typographyFont="captionMedium">
                    {formattedValue}
                </BaseText>
                <TokenImage icon={icon} isVechainToken iconSize={16} rounded={true} />
            </BaseView>
        </BaseView>
    )
}

export const StargateCarouselItem = ({ item }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
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

    const { data: claimableRewards } = useStargateClaimableRewards({ nodeId: item.nodeId })

    return (
        <BaseCard containerStyle={styles.root} style={styles.rootContent}>
            <StargateImage uri={data?.image} />
            <BaseText color={theme.colors.assetDetailsCard.title} typographyFont="bodySemiBold">
                {getTokenLevelName(
                    (item.nodeLevel ? (item.nodeLevel as TokenLevelId) : undefined) ?? TokenLevelId.None,
                )}
            </BaseText>
            <BaseView flexDirection="column" gap={8}>
                <RowItem
                    label={LL.STARGATE_LOCKED()}
                    value={item.vetAmountStaked ?? "0"}
                    icon={VET.icon}
                    testID="STARGATE_CAROUSEL_ITEM_VALUE_LOCKED"
                />
                <RowItem
                    label={LL.STARGATE_REWARDS()}
                    value={item.accumulatedRewards ?? "0"}
                    icon={VTHO.icon}
                    testID="STARGATE_CAROUSEL_ITEM_VALUE_REWARDS"
                />
                <RowItem
                    label={LL.STARGATE_CLAIMABLE()}
                    value={claimableRewards ?? "0"}
                    icon={VTHO.icon}
                    testID="STARGATE_CAROUSEL_ITEM_VALUE_CLAIMABLE"
                />
            </BaseView>
        </BaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            borderRadius: 16,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE,
            borderColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_100,
            borderWidth: 1,
            minWidth: 240,
            height: "100%",
        },
        rootContent: {
            padding: 16,
            flexDirection: "column",
            gap: 12,
        },
        image: {
            width: 208,
            height: 160,
            borderRadius: 8,
        },
    })
