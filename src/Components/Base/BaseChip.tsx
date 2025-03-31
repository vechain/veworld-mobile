import React from "react"
import { BaseTouchable } from "./BaseTouchable"
import { BaseText } from "./BaseText"
import { useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"

type Props = {
    label: string
    active: boolean
    onPress: () => void
}

export const BaseChip = ({ label, active, onPress }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const backgroundColor = active ? theme.colors.primaryLight : theme.colors.card
    const textColor = active ? theme.colors.textReversed : theme.colors.text
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
