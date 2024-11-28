import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { AlertStatus, ICON_NAMES, StatusColorVariant } from "~Components/Reusable/Alert/utils/AlertConfigs"
import { ColorThemeType } from "~Constants"

type AlertInlineVariant = "banner" | "inline"

interface AlertInlineProps {
    message: string
    status: AlertStatus
    variant?: AlertInlineVariant
}

export const AlertInline = memo(({ message, status, variant = "inline" }: AlertInlineProps) => {
    const statusVariant = StatusColorVariant[status]
    const isInline = useMemo(() => variant === "inline", [variant])
    const { styles, theme } = useThemedStyles(baseStyles(isInline, statusVariant))
    const colors = theme.colors[statusVariant]

    return (
        <BaseView style={styles.container}>
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

const baseStyles = (isInline: boolean, status: StatusColorVariant) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            alignItems: "flex-start",
            justifyContent: "flex-start",
            paddingHorizontal: isInline ? 0 : 12,
            paddingVertical: isInline ? 0 : 8,
            backgroundColor: isInline ? theme.colors.transparent : theme.colors[status].background,
            borderRadius: isInline ? 0 : 6,
        },
        row: {
            flexDirection: "row",
            alignItems: "flex-start",
        },
    })
