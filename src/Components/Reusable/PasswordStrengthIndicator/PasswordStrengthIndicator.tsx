import React from "react"
import { StyleSheet } from "react-native"
import Animated, { SharedValue, interpolateColor, useAnimatedStyle, useDerivedValue } from "react-native-reanimated"
import { BaseText, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"
import { BaseAnimatedText } from "../AnimatedTextInput"

type Props = {
    strength: SharedValue<number>
}

export const PasswordStrengthIndicator = ({ strength }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

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
        <BaseView pt={18} px={6} justifyContent="center" mb={12}>
            <BaseView style={styles.barBackground}>
                <Animated.View style={[styles.bar, animatedStyle]} />
            </BaseView>

            <BaseView pt={PlatformUtils.isIOS() ? 12 : 6} flexDirection="row" justifyContent="flex-start">
                <BaseText pt={PlatformUtils.isAndroid() ? 3 : 2} pr={4} typographyFont="caption">
                    {"Security:"}
                </BaseText>
                <BaseAnimatedText editable={false} text={computedStrength} style={styles.securityText} />
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        barBackground: {
            height: 8,
            backgroundColor: "#e0e0e0",
            borderRadius: 4,
            overflow: "hidden",
        },
        bar: {
            height: 8,
            borderRadius: 4,
        },
        securityText: {
            fontFamily: "Inter-Light",
            // fontSize: 12,
            // fontWeight: "normal",
            // lineHeight: 1,
            padding: 0,
            color: theme.colors.text,
        },
    })

export default PasswordStrengthIndicator
