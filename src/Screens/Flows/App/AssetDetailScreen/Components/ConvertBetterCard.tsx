import { BottomSheetTextInput } from "@gorhom/bottom-sheet"
import React, { useCallback, useMemo } from "react"
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, { AnimatedStyle } from "react-native-reanimated"
import { BaseButton, BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { B3TR, ColorThemeType, VOT3 } from "~Constants"
import { TokenWithCompleteInfo, useFormatFiat, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Balance } from "~Model"
import { BigNutils } from "~Utils"

type Props = {
    token?: TokenWithCompleteInfo
    balance?: Balance
    isSender: boolean
    sendAmount: string
    animatedStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
    error?: boolean
    onSendAmountChange?: (amount: string) => void
    onMaxAmountPress?: (maxAmount: string) => void
}

export const ConvertBetterCard: React.FC<Props> = ({
    token,
    balance,
    isSender,
    sendAmount,
    animatedStyle,
    error,
    onSendAmountChange,
    onMaxAmountPress,
}) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { formatLocale } = useFormatFiat()

    const tokenTotalBalance = useMemo(() => {
        return BigNutils(balance?.balance).toString
    }, [balance?.balance])

    const tokenTotalToHuman = useMemo(() => {
        return BigNutils(tokenTotalBalance)
            .toHuman(token?.decimals ?? 18)
            .toTokenFormat_string(2, formatLocale)
    }, [formatLocale, token?.decimals, tokenTotalBalance])

    const computedTotalBalanceStyle = useMemo(() => {
        return error ? [styles.totalBalanceError] : []
    }, [styles, error])

    const computedInputStyle = useMemo(() => {
        const inputStyles = [styles.input]
        if (!isSender) inputStyles.push(styles.disabledInput)
        if (error && isSender) inputStyles.push(styles.inputError)
        return inputStyles
    }, [styles, isSender, error])

    const renderIcon = useMemo(() => {
        if (token?.symbol === B3TR.symbol) return B3TR.icon
        if (token?.symbol === VOT3.symbol) return VOT3.icon

        return token?.icon
    }, [token?.icon, token?.symbol])

    const handleOnMaxPress = useCallback(() => {
        onMaxAmountPress?.(tokenTotalToHuman)
    }, [onMaxAmountPress, tokenTotalToHuman])

    return (
        <Animated.View style={animatedStyle}>
            <BaseCard style={[styles.container]}>
                <BaseView flexDirection="row" flex={1} justifyContent="space-between">
                    <BaseView flex={1}>
                        <BaseText
                            typographyFont="captionSemiBold"
                            color={theme.colors.convertBetterCard.convertValueText}>
                            {isSender ? LL.FROM() : LL.TO()}
                        </BaseText>
                        <BaseSpacer height={12} />
                        <BaseView flexDirection="row" justifyContent="flex-start">
                            <BaseView borderRadius={30} overflow="hidden">
                                <Image source={{ uri: renderIcon }} width={24} height={24} />
                            </BaseView>

                            <BaseSpacer width={12} />
                            <BaseText typographyFont="bodySemiBold">{token?.name}</BaseText>
                        </BaseView>
                    </BaseView>

                    <BaseView flex={1} justifyContent="center" alignItems="flex-end" style={[styles.inputContainer]}>
                        {isSender && (
                            <BaseView style={[styles.balanceContainer]}>
                                <BaseText
                                    typographyFont="captionMedium"
                                    color={theme.colors.convertBetterCard.convertValueText}
                                    style={computedTotalBalanceStyle}>
                                    {tokenTotalToHuman}
                                </BaseText>
                                <BaseButton
                                    typographyFont="captionSemiBold"
                                    disabled={BigNutils(tokenTotalBalance).isZero}
                                    variant="outline"
                                    textColor={theme.colors.actionBanner.buttonText}
                                    style={[styles.maxButton]}
                                    radius={4}
                                    action={handleOnMaxPress}
                                    p={0}>
                                    {"Max"}
                                </BaseButton>
                            </BaseView>
                        )}

                        <BaseView flexDirection="row" flex={1}>
                            <BottomSheetTextInput
                                testID="ConvertBetter_input"
                                placeholder={"0"}
                                keyboardType="numeric"
                                editable={isSender}
                                contextMenuHidden
                                value={sendAmount}
                                textAlign="right"
                                autoFocus={isSender}
                                placeholderTextColor={
                                    isSender
                                        ? theme.colors.convertBetterCard.inputText
                                        : theme.colors.convertBetterCard.convertValueText
                                }
                                onChangeText={onSendAmountChange}
                                style={computedInputStyle}
                            />
                        </BaseView>
                    </BaseView>
                </BaseView>
            </BaseCard>
        </Animated.View>
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
        },
        inputContainer: {
            gap: 12,
        },
        input: {
            flex: 1,
            color: theme.colors.convertBetterCard.inputText,
            fontWeight: String("600"),
            fontSize: 20,
            padding: 0,
        },
        disabledInput: {
            color: theme.colors.convertBetterCard.convertValueText,
        },
        inputError: {
            color: theme.colors.errorVariant.title,
        },
        balanceContainer: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
        },
        totalBalanceError: {
            color: theme.colors.errorVariant.title,
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
