import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseCard, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType, VET, VTHO } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import type { NodeInfo } from "~Model"
import { getTokenLevelName, TokenLevelId } from "~Utils/StargateUtils"
import { StargateCarouselItemAPY } from "./StargateCarouselItemAPY"
import { StargateCarouselItemClaimable } from "./StargateCarouselItemClaimable"
import { StargateCarouselItemCycle } from "./StargateCarouselItemCycle"
import { StargateCarouselItemImage } from "./StargateCarouselItemImage"
import { StargateCarouselItemStats } from "./StargateCarouselItemStats"

type Props = {
    item: NodeInfo
}

export const StargateCarouselItem = ({ item }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const tokenLevel = useMemo(
        () => (item.nodeLevel ? (item.nodeLevel as TokenLevelId) : undefined) ?? TokenLevelId.None,
        [item.nodeLevel],
    )

    const tokenLevelName = useMemo(() => getTokenLevelName(tokenLevel), [tokenLevel])

    return (
        <BaseCard containerStyle={styles.root} style={styles.rootContent}>
            <StargateCarouselItemImage item={item} />
            <BaseText color={theme.colors.assetDetailsCard.title} typographyFont="bodySemiBold">
                {tokenLevelName}
            </BaseText>
            <BaseView flexDirection="column" gap={8}>
                <StargateCarouselItemAPY validatorId={item.validatorId} levelName={tokenLevelName} />
                <StargateCarouselItemCycle validatorId={item.validatorId} />
                <StargateCarouselItemStats.Token
                    label={LL.STARGATE_LOCKED()}
                    value={item.vetAmountStaked ?? "0"}
                    icon={VET.icon}
                    testID="STARGATE_CAROUSEL_ITEM_VALUE_LOCKED"
                />
                <StargateCarouselItemStats.Token
                    label={LL.STARGATE_REWARDS()}
                    value={item.accumulatedRewards ?? "0"}
                    icon={VTHO.icon}
                    testID="STARGATE_CAROUSEL_ITEM_VALUE_REWARDS"
                />
                <StargateCarouselItemClaimable nodeId={item.nodeId} />
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
