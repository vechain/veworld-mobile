import { ethers } from "ethers"
import { default as React, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, GasPriceCoefficient } from "~Constants"
import { useBlinkStyles, useFormatFiat, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees/useTransactionFees"
import { useI18nContext } from "~i18n"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { BaseAnimatedText } from "../BaseAnimatedText"
import { NoTokensAvailableForFee } from "./NoTokensAvailableForFee"
import { NoVthoBalanceAlert } from "./NoVthoBalanceAlert"
import { TokenSelector } from "./TokenSelector"

type Props = {
    options: TransactionFeesResult
    selectedFeeOption: GasPriceCoefficient
    secondsRemaining: number
    onDelegationTokenClicked: () => void
    selectedDelegationToken: string
    isEnoughBalance: boolean
    hasEnoughBalanceOnAny: boolean
}

export const GalacticaEstimation = ({
    options,
    selectedFeeOption,
    secondsRemaining,
    onDelegationTokenClicked,
    selectedDelegationToken,
    isEnoughBalance,
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

    const { maxFee } = useMemo(() => options[selectedFeeOption], [options, selectedFeeOption])
    const maxFeeVtho = useMemo(() => parseFloat(ethers.utils.formatEther(maxFee.toString)), [maxFee.toString])

    const maxFeeFiat = useMemo(() => {
        return BigNutils().toCurrencyConversion(maxFeeVtho.toString() || "0", exchangeRate ?? 1)
    }, [maxFeeVtho, exchangeRate])

    const maxFormattedFiat = useMemo(() => {
        if (maxFeeFiat.isLeesThan_0_01) return formatFiat({ amount: 0.01 })
        return formatFiat({ amount: parseFloat(maxFeeFiat.preciseValue) })
    }, [maxFeeFiat.isLeesThan_0_01, maxFeeFiat.preciseValue, formatFiat])

    const blinkStyles = useBlinkStyles({ enabled: secondsRemaining <= 3, duration: 1000 })

    return (
        <Animated.View layout={LinearTransition} style={styles.rootWithAlert}>
            <Animated.View layout={LinearTransition} style={styles.root}>
                <Animated.View layout={LinearTransition} style={styles.section}>
                    <BaseText color={theme.colors.textLight} typographyFont="captionMedium" numberOfLines={1}>
                        {LL.MAX_FEE()}
                    </BaseText>
                    <BaseView flexDirection="row" gap={8}>
                        <BaseAnimatedText
                            typographyFont="subSubTitleBold"
                            color={theme.colors.assetDetailsCard.title}
                            style={blinkStyles}
                            testID="GALACTICA_ESTIMATED_FEE">
                            {selectedDelegationToken}&nbsp;{formatValue(maxFeeVtho)}
                        </BaseAnimatedText>
                        <BaseAnimatedText
                            typographyFont="bodyMedium"
                            color={theme.colors.textLight}
                            style={blinkStyles}>
                            {maxFeeFiat.isLeesThan_0_01 ? `< ${maxFormattedFiat}` : maxFormattedFiat}
                        </BaseAnimatedText>
                    </BaseView>
                </Animated.View>
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
        section: {
            flexDirection: "column",
            gap: 4,
        },
        root: {
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
        },
        rootWithAlert: {
            padding: 16,
            flexDirection: "column",
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_100,
        },
    })
}
