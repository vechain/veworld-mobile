import { memo, default as React, useMemo } from "react"
import { Image, StyleSheet } from "react-native"
import { StargateAvatar } from "~Assets"
import { BaseSkeleton, BaseSpacer, BaseText, BaseView, FiatBalance } from "~Components"
import { VET } from "~Constants"
import { ColorThemeType } from "~Constants/Theme"
import { useFormatFiat, useTheme, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useUserNodes } from "~Hooks/Staking/useUserNodes"
import { useUserStargateNfts } from "~Hooks/Staking/useUserStargateNfts"
import { useI18nContext } from "~i18n"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"
import { BalanceUtils, BigNutils } from "~Utils"

type Props = {
    isBalanceVisible?: boolean
}

export const StakedCard = memo(({ isBalanceVisible = true }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const theme = useTheme()
    const { formatLocale } = useFormatFiat()

    const address = useAppSelector(selectSelectedAccountAddress)

    const vetTokenInfo = useTokenWithCompleteInfo(VET)

    const { stargateNodes, isLoading: isLoadingNodes } = useUserNodes(address)
    const { ownedStargateNfts, isLoading: isLoadingNfts } = useUserStargateNfts(stargateNodes, isLoadingNodes, 120000)

    const totalLockedVet = useMemo(() => {
        return ownedStargateNfts.reduce((acc, nft) => {
            return acc.plus(nft.vetAmountStaked ?? "0")
        }, BigNutils("0"))
    }, [ownedStargateNfts])

    const formattedLockedVet = useMemo(() => {
        return BigNutils(totalLockedVet.toBN).toHuman(VET.decimals).toTokenFormatFull_string(2, formatLocale)
    }, [totalLockedVet, formatLocale])

    const fiatBalance = useMemo(() => {
        return BalanceUtils.getFiatBalance(totalLockedVet.toString, vetTokenInfo.exchangeRate ?? 1, VET.decimals)
    }, [totalLockedVet.toString, vetTokenInfo.exchangeRate])

    const formattedFiatBalance = useMemo(() => {
        return BigNutils(fiatBalance).toTokenFormatFull_string(2, formatLocale)
    }, [fiatBalance, formatLocale])

    if (!isLoadingNfts && !isLoadingNodes && stargateNodes.length === 0) return null

    return (
        <BaseView mb={40}>
            <BaseText py={10} typographyFont="bodySemiBold">
                {LL.ACTIVITY_STAKING_LABEL()}
            </BaseText>
            <BaseSpacer height={8} />
            <BaseView style={styles.container}>
                <Image source={{ uri: StargateAvatar }} height={40} width={40} borderRadius={6} />
                <BaseView flex={1}>
                    <BaseText typographyFont="bodyMedium" color={theme.colors.tokenCardText}>
                        {LL.TITLE_TOTAL_LOCKED()}
                    </BaseText>
                    <BaseView style={styles.valueContainer}>
                        <BaseView style={styles.vetContainer}>
                            {isLoadingNfts || isLoadingNodes ? (
                                <BaseSkeleton
                                    height={20}
                                    width={100}
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={theme.colors.skeletonHighlightColor}
                                />
                            ) : (
                                <>
                                    <BaseText
                                        typographyFont="subSubTitleSemiBold"
                                        color={theme.colors.stakedCard.vetValue}>
                                        {VET.symbol}
                                    </BaseText>
                                    <BaseText
                                        typographyFont="subSubTitleSemiBold"
                                        color={theme.colors.stakedCard.vetValue}>
                                        {isBalanceVisible ? formattedLockedVet : "••••••"}
                                    </BaseText>
                                </>
                            )}
                        </BaseView>
                        <FiatBalance
                            isLoading={vetTokenInfo.exchangeRateLoading}
                            isVisible={isBalanceVisible}
                            balances={[formattedFiatBalance.toString()]}
                            typographyFont="bodyMedium"
                            color={theme.colors.stakedCard.fiatValue}
                        />
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.card,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            gap: 16,
        },
        valueContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        vetContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
    })
