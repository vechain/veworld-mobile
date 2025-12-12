import React from "react"
import { StyleSheet, Text, useWindowDimensions } from "react-native"
import Animated, { FadeIn, FadeInLeft, FadeOutLeft } from "react-native-reanimated"
import { BaseText } from "~Components"
import { CURRENCY, CURRENCY_SYMBOLS } from "~Constants"
import { typography } from "~Constants/Theme"
import { useTheme, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"

type Props = {
    isInputInFiat: boolean
    isError: boolean
    formattedInputDisplay: string
    currency: CURRENCY
    selectedToken: FungibleTokenWithBalance
}

const { defaults: defaultTypography } = typography

export const SelectAmountInput = React.memo<Props>(function AnimatedAmountInput({
    isInputInFiat,
    isError,
    formattedInputDisplay,
    currency,
    selectedToken,
}) {
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const { width: screenWidth } = useWindowDimensions()

    // Calculate available width for the text
    // 24 * 2 = horizontal padding of parent inputContainer
    // 48 = padding inside amountWrapper (24 * 2)
    // For fiat mode: 40 = currency symbol width + margin
    // For token mode: estimate symbol width based on symbol length (approx 12px per char + 8px spacing)
    const symbolWidth = isInputInFiat ? 40 : selectedToken.symbol.length * 12 + 8
    const availableWidth = screenWidth - 24 * 2 - 48 - symbolWidth

    return (
        <>
            {isInputInFiat ? (
                <Animated.View key="fiat" entering={FadeIn.duration(300)} style={styles.amountWrapper}>
                    <Animated.View entering={FadeInLeft.duration(300)} exiting={FadeOutLeft.duration(200)}>
                        <BaseText
                            typographyFont="headerTitleMedium"
                            color={isError ? theme.colors.danger : theme.colors.text}
                            style={styles.currencySymbol}>
                            {CURRENCY_SYMBOLS[currency]}
                        </BaseText>
                    </Animated.View>
                    <Text
                        style={[
                            styles.animatedInput,
                            {
                                color: isError ? theme.colors.danger : theme.colors.text,
                                maxWidth: availableWidth,
                            },
                        ]}
                        allowFontScaling={false}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.3}
                        testID="SendScreen_amountInput">
                        {formattedInputDisplay}
                    </Text>
                </Animated.View>
            ) : (
                <Animated.View key="token" entering={FadeIn.duration(300)} style={styles.amountWrapper}>
                    <Text
                        style={[
                            styles.animatedInput,
                            {
                                color: isError ? theme.colors.danger : theme.colors.text,
                                maxWidth: availableWidth,
                            },
                        ]}
                        allowFontScaling={false}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.3}
                        testID="SendScreen_amountInput">
                        {formattedInputDisplay}
                    </Text>
                    <Text
                        style={[
                            styles.tokenSymbolInline,
                            { color: isError ? theme.colors.danger : theme.colors.text },
                        ]}>
                        {" "}
                        {selectedToken.symbol}
                    </Text>
                </Animated.View>
            )}
        </>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        animatedInput: {
            fontFamily: defaultTypography.extraLargeTitleSemiBold.fontFamily,
            fontSize: defaultTypography.extraLargeTitleSemiBold.fontSize,
            fontWeight: defaultTypography.extraLargeTitleSemiBold.fontWeight,
            textAlign: "center",
        },
        currencySymbol: {
            marginRight: 8,
        },
        amountWrapper: {
            height: 64,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
        tokenSymbolInline: {
            fontFamily: defaultTypography.subSubTitleMedium.fontFamily,
            fontSize: defaultTypography.subSubTitleMedium.fontSize,
            fontWeight: defaultTypography.subSubTitleMedium.fontWeight,
        },
    })
