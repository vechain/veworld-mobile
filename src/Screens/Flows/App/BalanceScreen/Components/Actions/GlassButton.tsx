import React, { useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type GlassButtonProps = {
    icon: IconKey
    onPress: () => void
    disabled?: boolean
    size?: "sm" | "md"
}

const GlassButton = ({ icon, onPress, disabled, size = "md" }: GlassButtonProps) => {
    const { styles } = useThemedStyles(baseStyles(size))

    const [pressed, setPressed] = useState(false)

    const onPressIn = useCallback(() => setPressed(true), [])
    const onPressOut = useCallback(() => setPressed(false), [])

    const colors = useMemo(() => {
        if (pressed) return ["rgba(177, 168, 220, 0.20)", "rgba(29, 23, 58, 0.20)"]
        return ["rgba(29, 23, 58, 0.20)", "rgba(177, 168, 220, 0.20)"]
    }, [pressed])

    const borderStyle = useMemo(() => {
        if (pressed) return { borderColor: COLORS.PURPLE_LABEL_10 }
    }, [pressed])

    return (
        <Pressable onPress={onPress} disabled={disabled} onPressIn={onPressIn} onPressOut={onPressOut}>
            {disabled ? (
                <BaseView p={size === "sm" ? 10 : 16} borderRadius={99} bg={COLORS.PURPLE_LABEL_5}>
                    <BaseIcon name={icon} size={size === "sm" ? 20 : 24} color={COLORS.DARK_PURPLE_DISABLED} />
                </BaseView>
            ) : (
                <LinearGradient colors={colors} angle={0} useAngle style={[styles.gradientBtnContainer, borderStyle]}>
                    <BaseIcon name={icon} size={size === "sm" ? 20 : 24} color={COLORS.PURPLE_LABEL} />
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
}

export const GlassButtonWithLabel = ({ label, icon, onPress, disabled, size }: Props) => {
    return (
        <BaseView flexDirection="column" gap={8} alignItems="center">
            <GlassButton icon={icon} onPress={onPress} disabled={disabled} size={size} />
            <BaseText
                typographyFont="smallCaptionSemiBold"
                color={disabled ? COLORS.DARK_PURPLE_DISABLED : COLORS.PURPLE_LABEL}>
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
    })
