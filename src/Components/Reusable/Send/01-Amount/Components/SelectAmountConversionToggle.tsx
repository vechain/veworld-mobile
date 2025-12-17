import React, { useMemo } from "react"
import { StyleSheet, Text } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType, CURRENCY, CURRENCY_SYMBOLS, SYMBOL_POSITIONS } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectSymbolPosition, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"

type Props = {
    exchangeRate?: number | null
    isError: boolean
    isInputInFiat: boolean
    formattedConvertedAmount: string
    currency: CURRENCY
    selectedToken: FungibleTokenWithBalance
    onToggle: () => void
}

export const SelectAmountConversionToggle = React.memo<Props>(function ConversionToggle({
    exchangeRate,
    isError,
    isInputInFiat,
    formattedConvertedAmount,
    currency,
    selectedToken,
    onToggle,
}) {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)

    const symbolPosition = useAppSelector(selectSymbolPosition)

    const formattedAmount = useMemo(() => {
        if (isInputInFiat) return formattedConvertedAmount
        const currencySymbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS]
        if (symbolPosition === SYMBOL_POSITIONS.AFTER) {
            return `${formattedConvertedAmount} ${currencySymbol}`
        }
        return `${currencySymbol} ${formattedConvertedAmount}`
    }, [isInputInFiat, formattedConvertedAmount, currency, symbolPosition])

    if (!exchangeRate && !isError) return null

    if (isError) {
        return (
            <BaseText color={theme.colors.danger} typographyFont="captionMedium" testID="SEND_AMOUNT_EXCEEDS_BALANCE">
                {LL.SEND_AMOUNT_EXCEEDS_BALANCE()}
            </BaseText>
        )
    }

    return (
        <BaseTouchable action={onToggle} haptics="Light" disabled={isError}>
            <BaseView flexDirection="row" alignItems="center" gap={4}>
                <Animated.View key={isInputInFiat ? "token-conv" : "fiat-conv"} entering={FadeIn.duration(300)}>
                    <BaseText color={theme.colors.textLightish} typographyFont="bodySemiBold">
                        {formattedAmount}
                        {isInputInFiat && <Text style={styles.convertedSymbol}> {selectedToken.symbol}</Text>}
                    </BaseText>
                </Animated.View>
                <BaseSpacer width={2} />
                <BaseIcon name="icon-arrow-up-down" size={12} color={theme.colors.textLightish} />
            </BaseView>
        </BaseTouchable>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        convertedSymbol: {
            color: theme.colors.textLightish,
        },
    })
