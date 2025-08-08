import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseText } from "./BaseText"
import { BaseTouchable } from "./BaseTouchable"

type Props = {
    label: string
    active: boolean
    onPress: () => void
}

export const BaseChip = ({ label, active, onPress }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const backgroundColor = useMemo(() => {
        if (active) {
            return theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE
        }
        return theme.isDark ? COLORS.PURPLE : COLORS.GREY_50
    }, [active, theme.isDark])

    const textColor = useMemo(() => {
        if (active) {
            return theme.isDark ? COLORS.PURPLE : COLORS.WHITE
        }
        return theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600
    }, [active, theme.isDark])
    return (
        <BaseTouchable
            style={[styles.rootContainer, { backgroundColor: backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.8}>
            <BaseText style={{ color: textColor }} typographyFont="bodyMedium">
                {label}
            </BaseText>
        </BaseTouchable>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        rootContainer: {
            minWidth: 64,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            alignItems: "center",
        },
        filterContainer: {
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
        },
    })
