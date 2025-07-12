import React, { memo, useMemo } from "react"
import { Image, StyleSheet } from "react-native"
import { StargateAvatar } from "~Assets"
import { BaseSkeleton, BaseSpacer, BaseText, BaseView, FiatBalance } from "~Components"
import { VET } from "~Constants"
import { ColorThemeType } from "~Constants/Theme"
import { useFormatFiat, useTheme, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useUserNodes } from "~Hooks/Staking/useUserNodes"
import { useUserStargateNfts } from "~Hooks/Staking/useUserStargateNfts"
import { formatUnits } from "ethers/lib/utils"
import { useI18nContext } from "~i18n"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"

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
        return ownedStargateNfts
            .filter(nft => !!nft.isDelegated)
            .reduce((acc, nft) => {
                const stakedAmount = nft.vetAmountStaked ? formatUnits(nft.vetAmountStaked, VET.decimals) : "0"
                return acc + Number(stakedAmount)
            }, 0)
    }, [ownedStargateNfts])

    const formattedLockedVet = useMemo(() => {
        return totalLockedVet.toLocaleString(formatLocale, {
            maximumFractionDigits: 2,
        })
    }, [totalLockedVet, formatLocale])

    const fiatValueOfLockedVet = totalLockedVet * (vetTokenInfo.exchangeRate ?? 0)

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
                            balances={[fiatValueOfLockedVet.toString()]}
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
