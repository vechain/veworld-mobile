import React from "react"
import { StyleSheet, Text } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType, CURRENCY, CURRENCY_SYMBOLS } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
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

    if (!exchangeRate && !isError) return null

    if (isError) {
        return (
            <BaseText color={theme.colors.danger} typographyFont="captionMedium">
                {LL.SEND_AMOUNT_EXCEEDS_BALANCE()}
            </BaseText>
        )
    }

    return (
        <BaseTouchable action={onToggle} haptics="Light" disabled={isError}>
            <BaseView flexDirection="row" alignItems="center" gap={4}>
                <Animated.View key={isInputInFiat ? "token-conv" : "fiat-conv"} entering={FadeIn.duration(300)}>
                    <BaseText color={theme.colors.textLightish} typographyFont="bodySemiBold">
                        {!isInputInFiat && CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS]}
                        {formattedConvertedAmount}
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
