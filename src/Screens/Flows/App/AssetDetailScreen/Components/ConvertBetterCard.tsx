import { BottomSheetTextInput } from "@gorhom/bottom-sheet"
import React, { useCallback, useMemo } from "react"
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, { AnimatedStyle } from "react-native-reanimated"
import { BaseButton, BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType, typography } from "~Constants"
import { useThemedStyles, useTotalTokenBalance } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

type Props = {
    token: FungibleTokenWithBalance
    isSender: boolean
    sendAmount: string
    animatedStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
    error?: boolean
    onSendAmountChange?: (amount: string) => void
    onMaxAmountPress?: (maxAmount: string) => void
}

const { defaults: defaultTypography } = typography

export const ConvertBetterCard: React.FC<Props> = ({
    token,
    isSender,
    sendAmount,
    animatedStyle,
    error,
    onSendAmountChange,
    onMaxAmountPress,
}) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { tokenTotalToHuman, tokenTotalBalance } = useTotalTokenBalance(token, sendAmount, selectedAccount.address, 2)

    const computedTotalBalanceStyle = useMemo(() => {
        return error ? [styles.totalBalanceError] : []
    }, [styles, error])

    const computedInputStyle = useMemo(() => {
        const inputStyles = [styles.input]
        if (!isSender) inputStyles.push(styles.disabledInput)
        if (error && isSender) inputStyles.push(styles.inputError)
        return inputStyles
    }, [styles, isSender, error])

    const handleOnMaxPress = useCallback(() => {
        onMaxAmountPress?.(tokenTotalToHuman)
    }, [onMaxAmountPress, tokenTotalToHuman])

    return (
        <Animated.View style={animatedStyle}>
            <BaseCard style={[styles.container]}>
                <BaseView flexDirection="row" flex={1} justifyContent="space-between">
                    <BaseView flex={1}>
                        <BaseText typographyFont="captionSemiBold">{isSender ? LL.FROM() : LL.TO()}</BaseText>
                        <BaseSpacer height={12} />
                        <BaseView flexDirection="row" justifyContent="flex-start">
                            <Image source={{ uri: token.icon }} width={24} height={24} />
                            <BaseSpacer width={12} />
                            <BaseText typographyFont="bodySemiBold">{token.name}</BaseText>
                        </BaseView>
                    </BaseView>

                    <BaseView flex={1} justifyContent="center" alignItems="flex-end" style={[styles.inputContainer]}>
                        {isSender && (
                            <BaseView style={[styles.balanceContainer]}>
                                <BaseText typographyFont="captionMedium" style={computedTotalBalanceStyle}>
                                    {tokenTotalToHuman}
                                </BaseText>
                                <BaseButton
                                    typographyFont="captionSemiBold"
                                    disabled={BigNutils(tokenTotalBalance).isZero}
                                    variant="outline"
                                    textColor={theme.colors.actionBanner.buttonText}
                                    style={[styles.maxButton]}
                                    action={handleOnMaxPress}>
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
            ...defaultTypography.title,
            flex: 1,
            color: theme.colors.convertBetterCard.inputText,
            fontWeight: 600,
            fontSize: 20,
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
        },
    })
