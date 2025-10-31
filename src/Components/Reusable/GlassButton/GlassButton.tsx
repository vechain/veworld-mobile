import React, { useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type GlassButtonProps = {
    icon: IconKey
    onPress: () => void
    disabled?: boolean
    size?: "sm" | "md"
    /**
     * Whether to change color based on theme
     */
    themed?: boolean
}

const GlassButton = ({ icon, onPress, disabled, size = "md", themed }: GlassButtonProps) => {
    const { styles, theme } = useThemedStyles(baseStyles(size))

    const [pressed, setPressed] = useState(false)

    const onPressIn = useCallback(() => setPressed(true), [])
    const onPressOut = useCallback(() => setPressed(false), [])

    const darkGradientColors = useMemo(() => {
        if (pressed) return ["rgba(177, 168, 220, 0.20)", "rgba(29, 23, 58, 0.20)"]
        return ["rgba(29, 23, 58, 0.20)", "rgba(177, 168, 220, 0.20)"]
    }, [pressed])

    const lightGradientColors = useMemo(() => {
        if (pressed) return ["#E7E9EB", "#F9F9FA"].reverse()
        return ["#E7E9EB", "#F9F9FA"]
    }, [pressed])

    const gradientColors = useMemo(() => {
        if (!themed) return darkGradientColors
        return theme.isDark ? darkGradientColors : lightGradientColors
    }, [darkGradientColors, lightGradientColors, theme.isDark, themed])

    const darkBorderColor = useMemo(() => {
        if (pressed) return COLORS.PURPLE_LABEL_10
        return COLORS.PURPLE_LABEL_5
    }, [pressed])

    const lightBorderColor = useMemo(() => {
        return "rgba(231, 233, 235, 0.50)"
    }, [])

    const borderStyle = useMemo(() => {
        if (!themed) return { borderColor: darkBorderColor }
        return theme.isDark ? { borderColor: darkBorderColor } : { borderColor: lightBorderColor }
    }, [darkBorderColor, lightBorderColor, theme.isDark, themed])

    const darkDisabledColors = useMemo(() => {
        return {
            backgroundColor: COLORS.PURPLE_LABEL_5,
            iconColor: COLORS.DARK_PURPLE_DISABLED,
        }
    }, [])

    const lightDisabledColors = useMemo(() => {
        return {
            backgroundColor: COLORS.GREY_100,
            iconColor: COLORS.GREY_400,
        }
    }, [])

    const { backgroundColor, iconColor } = useMemo(() => {
        if (!themed) return darkDisabledColors
        return theme.isDark ? darkDisabledColors : lightDisabledColors
    }, [darkDisabledColors, lightDisabledColors, theme.isDark, themed])

    const activeIconColor = useMemo(() => {
        if (!themed || theme.isDark) return COLORS.PURPLE_LABEL
        return COLORS.PURPLE
    }, [theme.isDark, themed])

    return (
        <Pressable onPress={onPress} disabled={disabled} onPressIn={onPressIn} onPressOut={onPressOut}>
            {disabled ? (
                <BaseView
                    p={size === "sm" ? 10 : 16}
                    borderRadius={99}
                    bg={backgroundColor}
                    style={styles.disabledBorderStyle}>
                    <BaseIcon name={icon} size={size === "sm" ? 20 : 24} color={iconColor} />
                </BaseView>
            ) : (
                <LinearGradient
                    colors={gradientColors}
                    angle={0}
                    useAngle
                    style={[styles.gradientBtnContainer, borderStyle]}>
                    <BaseIcon name={icon} size={size === "sm" ? 20 : 24} color={activeIconColor} />
                </LinearGradient>
            )}
        </Pressable>
    )
}

type Props = {
    label: string
    icon: IconKey
    onPress: () => void
    disabled?: boolean
    size?: "sm" | "md"
    /**
     * Whether to change color based on theme
     */
    themed?: boolean
}

export const GlassButtonWithLabel = ({ label, icon, onPress, disabled, size, themed }: Props) => {
    const theme = useTheme()
    const activeTextColor = useMemo(() => {
        if (!themed || theme.isDark) return COLORS.PURPLE_LABEL
        return COLORS.PURPLE
    }, [theme.isDark, themed])
    const disabledTextColor = useMemo(() => {
        if (!themed || theme.isDark) return COLORS.DARK_PURPLE_DISABLED
        return COLORS.GREY_400
    }, [theme.isDark, themed])
    return (
        <BaseView flexDirection="column" gap={8} alignItems="center">
            <GlassButton icon={icon} onPress={onPress} disabled={disabled} size={size} themed={themed} />
            <BaseText typographyFont="captionSemiBold" color={disabled ? disabledTextColor : activeTextColor}>
                {label}
            </BaseText>
        </BaseView>
    )
}

const baseStyles = (size: "sm" | "md") => () =>
    StyleSheet.create({
        gradientBtnContainer: {
            padding: size === "sm" ? 10 : 16,
            borderRadius: 99,
            borderWidth: 1,
            borderColor: COLORS.PURPLE_LABEL_5,
        },
        disabledBorderStyle: {
            borderWidth: 1,
            borderColor: COLORS.TRANSPARENT,
        },
    })
