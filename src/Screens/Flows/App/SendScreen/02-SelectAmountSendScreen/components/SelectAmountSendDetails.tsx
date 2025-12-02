import React from "react"
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native"
import Animated, { FadeIn, FadeInLeft, FadeOutLeft } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { CURRENCY, CURRENCY_SYMBOLS } from "~Constants"
import { ColorThemeType, typography } from "~Constants/Theme"
import { useTheme, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { useI18nContext } from "~i18n"

const { defaults: defaultTypography } = typography

type AnimatedAmountInputProps = {
    isInputInFiat: boolean
    isError: boolean
    formattedInputDisplay: string
    currency: CURRENCY
    selectedToken: FungibleTokenWithBalance
}

type ConversionToggleProps = {
    exchangeRate?: number | null
    isError: boolean
    isInputInFiat: boolean
    formattedConvertedAmount: string
    currency: CURRENCY
    selectedToken: FungibleTokenWithBalance
    onToggle: () => void
}

type TokenSelectorButtonProps = {
    computedIcon: string
    tokenBalance: string
    onOpenSelector: () => void
    onMaxPress: () => void
}

const SelectAmountSendDetails = () => null

SelectAmountSendDetails.AnimatedAmountInput = React.memo<AnimatedAmountInputProps>(function AnimatedAmountInput({
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

SelectAmountSendDetails.ConversionToggle = React.memo<ConversionToggleProps>(function ConversionToggle({
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

SelectAmountSendDetails.TokenSelectorButton = React.memo<TokenSelectorButtonProps>(function TokenSelectorButton({
    computedIcon,
    tokenBalance,
    onOpenSelector,
    onMaxPress,
}) {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const tokenAmountCard = theme.colors.sendScreen.tokenAmountCard

    return (
        <TouchableOpacity onPress={onOpenSelector}>
            <BaseView style={styles.tokenSelector} mx={18}>
                <BaseView flexDirection="row" alignItems="center" gap={8}>
                    <BaseIcon name="icon-chevrons-up-down" size={16} color={tokenAmountCard.tokenSelectIcon} />
                    <BaseView flexDirection="row" alignItems="center" gap={8}>
                        <TokenImage icon={computedIcon} iconSize={24} rounded={true} />
                        <BaseText typographyFont="bodySemiBold" color={tokenAmountCard.tokenSelectorText}>
                            {tokenBalance}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseTouchable action={onMaxPress} style={styles.maxButton}>
                    <BaseText typographyFont="captionSemiBold" color={tokenAmountCard.maxButtonText}>
                        {LL.COMMON_MAX()}
                    </BaseText>
                </BaseTouchable>
            </BaseView>
        </TouchableOpacity>
    )
})

const baseStyles = (theme: ColorThemeType) =>
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
        convertedSymbol: {
            color: theme.colors.textLightish,
        },
        tokenSymbolInline: {
            fontFamily: defaultTypography.subSubTitleMedium.fontFamily,
            fontSize: defaultTypography.subSubTitleMedium.fontSize,
            fontWeight: defaultTypography.subSubTitleMedium.fontWeight,
        },
        tokenSelector: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.sendScreen.tokenAmountCard.tokenSelectorBorder,
            backgroundColor: theme.colors.card,
        },
        maxButton: {
            paddingHorizontal: 18,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.colors.sendScreen.tokenAmountCard.maxButtonBorder,
        },
    })

export { SelectAmountSendDetails }
