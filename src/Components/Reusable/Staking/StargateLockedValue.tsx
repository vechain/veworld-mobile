import React, { useMemo } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { StargateAvatar } from "~Assets"
import { BaseSkeleton, BaseText, BaseView } from "~Components/Base"
import { VET } from "~Constants"
import { useFormatFiat, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { NftData } from "~Model"
import { selectBalanceVisible, useAppSelector } from "~Storage/Redux"
import { BalanceUtils, BigNutils } from "~Utils"
import { FiatBalance } from "../FiatBalance"

type Props = {
    isLoading: boolean
    nfts: Pick<NftData, "vetAmountStaked">[] | undefined
    rootStyle?: StyleProp<ViewStyle>
}

export const StargateLockedValue = ({ isLoading, nfts = [], rootStyle }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const { formatLocale } = useFormatFiat()

    const vetTokenInfo = useTokenWithCompleteInfo(VET)

    const totalLockedVet = useMemo(() => {
        return nfts.reduce((acc, nft) => {
            return acc.plus(nft.vetAmountStaked ?? "0")
        }, BigNutils("0"))
    }, [nfts])

    const formattedLockedVet = useMemo(() => {
        return BigNutils(totalLockedVet.toBN).toHuman(VET.decimals).toTokenFormatFull_string(2, formatLocale)
    }, [totalLockedVet, formatLocale])

    const fiatBalance = useMemo(() => {
        return BalanceUtils.getFiatBalance(totalLockedVet.toString, vetTokenInfo.exchangeRate ?? 1, VET.decimals)
    }, [totalLockedVet.toString, vetTokenInfo.exchangeRate])
    return (
        <BaseView style={[styles.container, rootStyle]}>
            <FastImage source={StargateAvatar} style={styles.avatar as ImageStyle} />
            <BaseView flex={1}>
                <BaseText typographyFont="bodyMedium" color={theme.colors.tokenCardText}>
                    {LL.TITLE_TOTAL_LOCKED()}
                </BaseText>
                <BaseView style={styles.valueContainer}>
                    <BaseView style={styles.vetContainer}>
                        {isLoading ? (
                            <BaseSkeleton
                                height={20}
                                width={100}
                                boneColor={theme.colors.skeletonBoneColor}
                                highlightColor={theme.colors.skeletonHighlightColor}
                            />
                        ) : (
                            <>
                                <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.stakedCard.vetValue}>
                                    {VET.symbol}
                                </BaseText>
                                <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.stakedCard.vetValue}>
                                    {isBalanceVisible ? formattedLockedVet : "••••••"}
                                </BaseText>
                            </>
                        )}
                    </BaseView>
                    <FiatBalance
                        isLoading={vetTokenInfo.exchangeRateLoading || isLoading}
                        isVisible={isBalanceVisible}
                        balances={[fiatBalance]}
                        typographyFont="bodyMedium"
                        color={theme.colors.stakedCard.fiatValue}
                        skeletonHeight={12}
                        skeletonWidth={60}
                        skeletonBoneColor={theme.colors.skeletonBoneColor}
                        skeletonHighlightColor={theme.colors.skeletonHighlightColor}
                    />
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
        },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: 6,
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
