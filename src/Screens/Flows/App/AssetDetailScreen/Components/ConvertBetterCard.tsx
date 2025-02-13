import { BottomSheetTextInput } from "@gorhom/bottom-sheet"
import React, { useCallback } from "react"
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, { AnimatedStyle } from "react-native-reanimated"
import { BaseButton, BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType, typography } from "~Constants"
import { TokenWithCompleteInfo, useThemedStyles } from "~Hooks"

type Props = {
    token: TokenWithCompleteInfo
    isSender: boolean
    sendAmount: string
    animatedStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
    onSendAmountChange?: (amount: string) => void
}

const { defaults: defaultTypography } = typography

export const ConvertBetterCard: React.FC<Props> = ({
    token,
    isSender,
    sendAmount,
    animatedStyle,
    onSendAmountChange,
}) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const onMaxAmountPress = useCallback(() => {
        onSendAmountChange?.(token.tokenUnitBalance)
    }, [onSendAmountChange, token.tokenUnitBalance])

    return (
        <Animated.View style={animatedStyle}>
            <BaseCard style={[styles.container]}>
                <BaseView flexDirection="row" flex={1} justifyContent="space-between">
                    <BaseView>
                        <BaseText typographyFont="captionSemiBold">{isSender ? "From" : "To"}</BaseText>
                        <BaseSpacer height={12} />
                        <BaseView flexDirection="row" justifyContent="flex-start">
                            <Image source={{ uri: token.icon }} width={24} height={24} />
                            <BaseSpacer width={12} />
                            <BaseText typographyFont="bodySemiBold">{token.name}</BaseText>
                        </BaseView>
                    </BaseView>

                    <BaseView justifyContent="center" alignItems="flex-end">
                        {isSender && (
                            <BaseView flexDirection="row" justifyContent="flex-end" style={[styles.balanceContainer]}>
                                <BaseText typographyFont="captionMedium">{token.tokenUnitBalance}</BaseText>
                                <BaseButton
                                    size="sm"
                                    variant="outline"
                                    textColor={theme.colors.actionBanner.buttonText}
                                    style={[styles.maxButton]}
                                    action={onMaxAmountPress}>
                                    {"Max"}
                                </BaseButton>
                            </BaseView>
                        )}
                        <BottomSheetTextInput
                            editable={isSender}
                            testID="ConvertBetter_input"
                            placeholder="0.00"
                            keyboardType="numeric"
                            contextMenuHidden
                            value={sendAmount}
                            onChangeText={onSendAmountChange}
                            style={[styles.input, !isSender && styles.disabledInput]}
                        />
                    </BaseView>
                </BaseView>
            </BaseCard>
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 24,
            paddingVertical: 16,
        },
        input: {
            ...defaultTypography.title,
            flex: 1,
            fontWeight: 600,
            fontSize: 20,
        },
        disabledInput: {
            opacity: 0.5,
        },
        balanceContainer: {
            gap: 8,
        },
        maxButton: {
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            paddingVertical: 4,
        },
    })
