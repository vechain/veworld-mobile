import React from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, GasPriceCoefficient } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { SPEED_MAP } from "./constants"

type Props = {
    speedChangeEnabled: boolean
    selectedFeeOption: GasPriceCoefficient
    onOpen: () => void
}

export const EditSpeedSection = ({ speedChangeEnabled, selectedFeeOption, onOpen }: Props) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles(speedChangeEnabled))

    const opacityStyles = useAnimatedStyle(() => {
        return {
            opacity: speedChangeEnabled ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 300 }),
        }
    }, [speedChangeEnabled])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            paddingVertical: speedChangeEnabled ? 12 : 0,
            paddingHorizontal: speedChangeEnabled ? 16 : 0,
        }
    }, [speedChangeEnabled])

    return (
        <Animated.View style={[styles.section, animatedStyles, opacityStyles]} layout={LinearTransition.duration(300)}>
            <BaseView flexDirection="column" gap={4} flex={1}>
                <BaseText color={theme.colors.textLightish} typographyFont="captionMedium">
                    {LL.SEND_ESTIMATED_TIME()}
                </BaseText>
                <BaseView flexDirection="row" gap={8}>
                    <BaseIcon name="icon-timer" size={16} color={theme.colors.textLight} />
                    <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.assetDetailsCard.title}>
                        {LL.UNDER_SECONDS({ seconds: SPEED_MAP[selectedFeeOption].asSeconds() })}
                    </BaseText>
                </BaseView>
            </BaseView>
            <BaseButton
                action={onOpen}
                variant="solid"
                bgColor={theme.colors.cardButton.background}
                style={styles.cardButton}
                py={8}
                px={12}
                typographyFont="captionSemiBold"
                textColor={theme.colors.cardButton.text}
                testID="GAS_FEE_SPEED_EDIT">
                {LL.EDIT_SPEED()}
            </BaseButton>
        </Animated.View>
    )
}

const baseStyles = (speedChangeEnabled: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        section: {
            flexDirection: "row",
            gap: 12,
            justifyContent: "space-between",
            width: "100%",
            paddingVertical: speedChangeEnabled ? 12 : 0,
            paddingHorizontal: speedChangeEnabled ? 16 : 0,
            height: speedChangeEnabled ? "auto" : 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_100,
            alignItems: "center",
        },
        cardButton: {
            borderColor: theme.colors.cardButton.border,
            borderWidth: 1,
            backgroundColor: theme.colors.cardButton.background,
            gap: 8,
            flexBasis: "35%",
            flexShrink: 1,
        },
    })
