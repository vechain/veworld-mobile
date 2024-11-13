import React from "react"
import { StyleSheet } from "react-native"
import Animated, { useAnimatedStyle, SharedValue, interpolateColor, useDerivedValue } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseAnimatedText } from "../AnimatedTextInput"

type Props = {
    strength: SharedValue<number>
    showComputedStrength?: boolean
}

export const PasswordStrengthIndicator = ({ strength, showComputedStrength = true }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${strength.value * 25}%`,
            backgroundColor: interpolateColor(
                strength.value,
                [0, 2, 4],
                [COLORS.DARK_RED, COLORS.MEDIUM_ORANGE, COLORS.LIGHT_GREEN],
            ),
        }
    })

    const computedStrength = useDerivedValue(() => {
        if (strength.value === 0) return "None"
        if (strength.value === 1) return "Weak"
        if (strength.value === 2) return "Fair"
        if (strength.value === 3) return "Medium"
        if (strength.value === 4) return "Strong"
        return "..."
    }, [strength.value])

    return (
        <BaseView mt={8} justifyContent="center" mb={12}>
            <BaseView flexDirection="row" justifyContent="flex-start">
                <BaseText typographyFont="smallCaptionRegular" color={theme.colors.text}>
                    {"Security"}
                </BaseText>

                <BaseSpacer width={4} />

                {showComputedStrength && <BaseAnimatedText text={computedStrength} style={styles.securityText} />}
            </BaseView>
            <BaseSpacer height={6} />
            <BaseView style={styles.barBackground}>
                <Animated.View style={[styles.bar, animatedStyle]} />
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        barBackground: {
            height: 4,
            backgroundColor: "#e0e0e0",
            borderRadius: 4,
            overflow: "hidden",
        },
        bar: {
            height: 4,
            borderRadius: 4,
        },
        securityText: {
            fontFamily: "Inter-Regular",
            fontSize: 11,
            lineHeight: 13,
            color: theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE,
        },
    })

export default PasswordStrengthIndicator
