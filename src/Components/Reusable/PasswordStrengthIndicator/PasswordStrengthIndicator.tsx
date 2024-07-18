import React from "react"
import { StyleSheet } from "react-native"
import Animated, { useAnimatedStyle, SharedValue, interpolateColor, useDerivedValue } from "react-native-reanimated"
import { BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { BaseAnimatedText } from "../AnimatedTextInput"

type Props = {
    strength: SharedValue<number>
}

export const PasswordStrengthIndicator = ({ strength }: Props) => {
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

            <BaseView flexDirection="row" justifyContent="flex-start">
                <BaseText typographyFont="caption" pt={4}>
                    {"Security:"}
                </BaseText>

                <BaseSpacer width={4} />

                <BaseAnimatedText text={computedStrength} style={styles.securityText} />
            </BaseView>
        </BaseView>
    )
}

const styles = StyleSheet.create({
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
        paddingTop: 6,
        fontFamily: "Inter-Light",
        fontSize: 12,
        fontWeight: "normal",
        lineHeight: 13,
    },
})

export default PasswordStrengthIndicator
