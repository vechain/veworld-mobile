import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { ColorThemeType } from "~Constants/Theme"
import { useFormatFiat, useTheme, useThemedStyles } from "~Hooks"
import { BigNutils } from "~Utils"
import { useI18nContext } from "~i18n"
import { SwapQuote } from "~Hooks/useSwap/types"

type SwapQuoteDisplayProps = {
    quote: SwapQuote
    slippageBasisPoints: number
    onSlippagePress: () => void
}

export const SwapQuoteDisplay: React.FC<SwapQuoteDisplayProps> = ({ quote, slippageBasisPoints, onSlippagePress }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const { formatLocale } = useFormatFiat()

    const rate = useMemo(() => {
        const inHuman = BigNutils(quote.amountInAfterFee).toHuman(quote.fromToken.decimals).toNumber
        const outHuman = BigNutils(quote.amountOut).toHuman(quote.toToken.decimals).toNumber
        if (inHuman === 0) return "0"
        return (outHuman / inHuman).toFixed(6)
    }, [quote])

    const feeDisplay = useMemo(() => {
        return BigNutils(quote.feeAmount)
            .toHuman(quote.fromToken.decimals)
            .toTokenFormat_string(6, formatLocale)
    }, [quote, formatLocale])

    const minReceivedDisplay = useMemo(() => {
        return BigNutils(quote.amountOutMin)
            .toHuman(quote.toToken.decimals)
            .toTokenFormat_string(6, formatLocale)
    }, [quote, formatLocale])

    const slippageDisplay = useMemo(() => {
        return `${(slippageBasisPoints / 100).toFixed(1)}%`
    }, [slippageBasisPoints])

    return (
        <BaseView style={styles.container} bg={theme.colors.card}>
            <QuoteRow
                label={LL.SWAP_NATIVE_QUOTE_VIA({ dex: quote.dexName })}
                value=""
            />
            <QuoteRow
                label={LL.SWAP_NATIVE_RATE()}
                value={`1 ${quote.fromToken.symbol} = ${rate} ${quote.toToken.symbol}`}
            />
            <QuoteRow
                label={LL.SWAP_NATIVE_FEE({ fee: "0.75" })}
                value={LL.SWAP_NATIVE_FEE_AMOUNT({ amount: feeDisplay, symbol: quote.fromToken.symbol })}
            />
            <QuoteRow
                label={LL.SWAP_NATIVE_MIN_RECEIVED()}
                value={`${minReceivedDisplay} ${quote.toToken.symbol}`}
            />
            {quote.priceImpact > 0 && (
                <QuoteRow
                    label={LL.SWAP_NATIVE_PRICE_IMPACT()}
                    value={`${quote.priceImpact.toFixed(2)}%`}
                    valueColor={quote.priceImpact > 5 ? "#FF4444" : undefined}
                />
            )}

            <BaseSpacer height={4} />

            <BaseTouchableBox action={onSlippagePress} containerStyle={styles.slippageButton}>
                <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                    <BaseText typographyFont="caption" color={theme.colors.subtitle}>
                        {LL.SWAP_NATIVE_SLIPPAGE()}
                    </BaseText>
                    <BaseText typographyFont="captionSemiBold" color={theme.colors.primary}>
                        {slippageDisplay}
                    </BaseText>
                </BaseView>
            </BaseTouchableBox>
        </BaseView>
    )
}

type QuoteRowProps = {
    label: string
    value: string
    valueColor?: string
}

const QuoteRow: React.FC<QuoteRowProps> = ({ label, value, valueColor }) => {
    const theme = useTheme()

    return (
        <BaseView flexDirection="row" justifyContent="space-between" py={4}>
            <BaseText typographyFont="caption" color={theme.colors.subtitle}>
                {label}
            </BaseText>
            {value !== "" && (
                <BaseText
                    typographyFont="captionSemiBold"
                    color={valueColor ?? theme.colors.text}
                    flex={1}
                    align="right"
                    numberOfLines={1}>
                    {value}
                </BaseText>
            )}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        slippageButton: {
            borderRadius: 8,
            paddingVertical: 4,
        },
    })
