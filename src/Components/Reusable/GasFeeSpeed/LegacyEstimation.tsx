import { ethers } from "ethers"
import { default as React, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseSkeleton, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, GasPriceCoefficient } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees/useTransactionFees"
import { useI18nContext } from "~i18n"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { NoTokensAvailableForFee } from "./NoTokensAvailableForFee"
import { NoVthoBalanceAlert } from "./NoVthoBalanceAlert"
import { TokenSelector } from "./TokenSelector"

type Props = {
    options: TransactionFeesResult
    selectedFeeOption: GasPriceCoefficient
    onDelegationTokenClicked: () => void
    selectedDelegationToken: string
    isEnoughBalance: boolean
    hasEnoughBalanceOnAny: boolean
    isFirstTimeLoadingFees: boolean
}

export const LegacyEstimation = ({
    options,
    selectedFeeOption,
    onDelegationTokenClicked,
    selectedDelegationToken,
    isEnoughBalance,
    isFirstTimeLoadingFees,
    hasEnoughBalanceOnAny,
}: Props) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)

    const currency = useAppSelector(selectCurrency)

    const { formatValue, formatFiat } = useFormatFiat()

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[selectedDelegationToken],
        vs_currency: currency,
    })

    const { estimatedFee } = useMemo(() => options[selectedFeeOption], [options, selectedFeeOption])

    const estimatedFeeVtho = useMemo(
        () => parseFloat(ethers.utils.formatEther(estimatedFee.toString)),
        [estimatedFee.toString],
    )

    const estimatedFeeFiat = useMemo(() => {
        return BigNutils().toCurrencyConversion(estimatedFeeVtho.toString() || "0", exchangeRate ?? 1)
    }, [exchangeRate, estimatedFeeVtho])

    const estimatedFormattedFiat = useMemo(() => {
        if (estimatedFeeFiat.isLeesThan_0_01) return formatFiat({ amount: 0.01 })
        return formatFiat({ amount: parseFloat(estimatedFeeFiat.preciseValue) })
    }, [estimatedFeeFiat.isLeesThan_0_01, estimatedFeeFiat.preciseValue, formatFiat])

    return (
        <Animated.View layout={LinearTransition} style={styles.rootWithAlert}>
            <Animated.View layout={LinearTransition} style={styles.root}>
                <BaseView flexDirection="column" gap={4}>
                    <BaseText color={theme.colors.textLightish} typographyFont="captionMedium">
                        {LL.GAS_FEE()}
                    </BaseText>
                    {isFirstTimeLoadingFees ? (
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            height={14}
                            width={60}
                        />
                    ) : (
                        <BaseView flexDirection="row" gap={8}>
                            <BaseText
                                typographyFont="subSubTitleBold"
                                color={theme.colors.assetDetailsCard.title}
                                testID="LEGACY_ESTIMATED_FEE">
                                {selectedDelegationToken}&nbsp;{formatValue(estimatedFeeVtho)}
                            </BaseText>
                            <BaseText typographyFont="bodyMedium" color={theme.colors.textLightish}>
                                {estimatedFeeFiat.isLeesThan_0_01
                                    ? `< ${estimatedFormattedFiat}`
                                    : estimatedFormattedFiat}
                            </BaseText>
                        </BaseView>
                    )}
                </BaseView>
                <TokenSelector onPress={onDelegationTokenClicked} token={selectedDelegationToken} />
            </Animated.View>
            {/* Make sure to only show the "NO VTHO" error when you have at least another token available */}
            {!hasEnoughBalanceOnAny ? (
                <NoTokensAvailableForFee isEnoughBalance={hasEnoughBalanceOnAny} />
            ) : (
                <NoVthoBalanceAlert isEnoughBalance={isEnoughBalance} delegationToken={selectedDelegationToken} />
            )}
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        root: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 12,
            paddingHorizontal: 16,
        },
        rootWithAlert: {
            paddingBottom: 12,
            flexDirection: "column",
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_100,
        },
    })
}
