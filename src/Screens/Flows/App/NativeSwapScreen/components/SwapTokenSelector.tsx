import React, { useCallback, useMemo } from "react"
import { Image, StyleSheet, TextInput } from "react-native"
import { BaseButton, BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { BigNutils } from "~Utils"
import { formatFullPrecision } from "~Utils/StandardizedFormatting"
import FontUtils from "~Utils/FontUtils"
import { useI18nContext } from "~i18n"

type SwapTokenSelectorProps = {
    label: string
    token: FungibleTokenWithBalance | undefined
    /** For editable (from): human-readable string. For read-only (to): raw amount. */
    amount: string
    onAmountChange?: (value: string) => void
    onTokenPress: () => void
    onMax?: () => void
    editable: boolean
    isLoading?: boolean
    isError?: boolean
}

export const SwapTokenSelector: React.FC<SwapTokenSelectorProps> = ({
    label,
    token,
    amount,
    onAmountChange,
    onTokenPress,
    onMax,
    editable,
    isLoading,
    isError,
}) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { formatLocale } = useFormatFiat()

    const tokenTotalBalance = useMemo(() => {
        return BigNutils(token?.balance?.balance).toString
    }, [token?.balance?.balance])

    const tokenTotalToHuman = useMemo(() => {
        if (!token) return "0"
        const humanBalance = BigNutils(tokenTotalBalance).toHuman(token.decimals).toString
        return formatFullPrecision(humanBalance, { locale: formatLocale, tokenSymbol: token.symbol })
    }, [formatLocale, token, tokenTotalBalance])

    // For read-only (to) card: convert raw to human
    const readOnlyDisplay = useMemo(() => {
        if (isLoading) return "..."
        if (!amount || !token) return "0"
        return BigNutils(amount).toHuman(token.decimals).toTokenFormat_string(6, formatLocale)
    }, [amount, token, formatLocale, isLoading])

    const handleOnMaxPress = useCallback(() => {
        onMax?.()
    }, [onMax])

    const computedInputStyle = useMemo(() => {
        const inputStyles = [styles.input]
        if (!editable) inputStyles.push(styles.disabledInput)
        if (isError && editable) inputStyles.push(styles.inputError)
        return inputStyles
    }, [styles, editable, isError])

    const computedTotalBalanceStyle = useMemo(() => {
        return isError ? [styles.totalBalanceError] : []
    }, [styles, isError])

    return (
        <BaseCard style={styles.container}>
            <BaseView flexDirection="row" flex={1} justifyContent="space-between">
                <BaseView flex={1}>
                    <BaseText
                        typographyFont="captionSemiBold"
                        color={theme.colors.convertBetterCard.convertValueText}>
                        {label}
                    </BaseText>
                    <BaseSpacer height={12} />
                    <BaseView
                        flexDirection="row"
                        justifyContent="flex-start"
                        alignItems="center"
                        onTouchEnd={onTokenPress}>
                        {token ? (
                            <>
                                <BaseView borderRadius={30} overflow="hidden">
                                    <Image source={{ uri: token.icon }} width={24} height={24} />
                                </BaseView>
                                <BaseSpacer width={12} />
                                <BaseText typographyFont="bodySemiBold">{token.symbol}</BaseText>
                                <BaseSpacer width={4} />
                                <BaseText typographyFont="caption" color={theme.colors.subtitle}>
                                    ▼
                                </BaseText>
                            </>
                        ) : (
                            <>
                                <BaseText typographyFont="bodySemiBold" color={theme.colors.primary}>
                                    {LL.SWAP_NATIVE_SELECT_TOKEN()}
                                </BaseText>
                                <BaseSpacer width={4} />
                                <BaseText typographyFont="caption">▼</BaseText>
                            </>
                        )}
                    </BaseView>
                </BaseView>

                <BaseView flex={1} justifyContent="center" alignItems="flex-end" style={styles.inputContainer}>
                    {editable && token && (
                        <BaseView style={styles.balanceContainer}>
                            <BaseText
                                typographyFont="captionMedium"
                                color={theme.colors.convertBetterCard.convertValueText}
                                style={computedTotalBalanceStyle}>
                                {tokenTotalToHuman}
                            </BaseText>
                            <BaseButton
                                testID="Swap_Max_Button"
                                typographyFont="smallCaptionSemiBold"
                                disabled={BigNutils(tokenTotalBalance).isZero}
                                variant="outline"
                                textColor={theme.colors.actionBanner.buttonText}
                                style={styles.maxButton}
                                radius={4}
                                action={handleOnMaxPress}
                                p={0}>
                                {"Max"}
                            </BaseButton>
                        </BaseView>
                    )}

                    <BaseView flexDirection="row" flex={1}>
                        {editable ? (
                            <TextInput
                                testID="Swap_Amount_Input"
                                placeholder="0"
                                keyboardType="decimal-pad"
                                editable={editable}
                                contextMenuHidden
                                value={amount}
                                textAlign="right"
                                placeholderTextColor={theme.colors.convertBetterCard.inputText}
                                onChangeText={onAmountChange}
                                style={computedInputStyle}
                            />
                        ) : (
                            <BaseText
                                typographyFont="bodySemiBold"
                                style={styles.input}
                                align="right"
                                color={
                                    isLoading
                                        ? theme.colors.convertBetterCard.convertValueText
                                        : theme.colors.convertBetterCard.inputText
                                }
                                numberOfLines={1}>
                                {readOnlyDisplay}
                            </BaseText>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.convertBetterCard.inputBg,
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderRadius: 12,
            minHeight: 95,
            borderWidth: 1,
            borderColor: theme.colors.convertBetterCard.borderColor,
        },
        inputContainer: {
            gap: 12,
        },
        input: {
            flex: 1,
            color: theme.colors.convertBetterCard.inputText,
            fontWeight: "600",
            fontSize: FontUtils.font(20),
            padding: 0,
        },
        disabledInput: {
            color: theme.colors.convertBetterCard.convertValueText,
        },
        inputError: {
            color: theme.colors.convertBetterCard.errorText,
        },
        balanceContainer: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
        },
        totalBalanceError: {
            color: theme.colors.convertBetterCard.errorText,
        },
        maxButton: {
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            paddingVertical: 4,
            paddingHorizontal: 0,
            width: 44,
        },
    })
