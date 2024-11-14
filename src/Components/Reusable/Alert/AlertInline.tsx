import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { AlertStatus, ICON_NAMES } from "~Components/Reusable/Alert/utils/AlertConfigs"

type AlertInlineVariant = "banner" | "inline"

interface AlertInlineProps {
    message: string
    status: AlertStatus
    variant?: AlertInlineVariant
}

export const AlertInline = memo(({ message, status, variant = "inline" }: AlertInlineProps) => {
    const theme = useTheme()
    const colors = theme.colors[`${status}Variant`]

    const isInline = useMemo(() => variant === "inline", [variant])

    const containerStyle = {
        ...styles[variant],
        ...(!isInline && {
            backgroundColor: colors.background,
        }),
    }

    return (
        <BaseView style={containerStyle}>
            <BaseView style={styles.row}>
                <BaseIcon name={ICON_NAMES[status]} size={16} color={colors.icon} />
                <BaseSpacer width={8} />
                <BaseText typographyFont="captionRegular" color={isInline ? colors.titleInline : colors.title}>
                    {message}
                </BaseText>
            </BaseView>
        </BaseView>
    )
})

const styles = StyleSheet.create({
    banner: {
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    inline: {
        padding: 0,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
})
