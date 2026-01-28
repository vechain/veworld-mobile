import React, { memo, useMemo } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { AlertStatus, ICON_NAMES, StatusColorVariant } from "~Components/Reusable/Alert/utils/AlertConfigs"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type AlertInlineVariant = "banner" | "inline"

interface AlertInlineProps {
    message: string
    status: AlertStatus
    variant?: AlertInlineVariant
    justifyContent?: "flex-start" | "center" | "flex-end"
    textAlign?: "left" | "center" | "right"
    style?: StyleProp<ViewStyle>
    contentStyle?: StyleProp<ViewStyle>
}

export const AlertInline = memo(
    ({
        message,
        status,
        variant = "inline",
        justifyContent = "flex-start",
        textAlign = "left",
        style,
        contentStyle,
    }: AlertInlineProps) => {
        const statusVariant = StatusColorVariant[status]
        const isInline = useMemo(() => variant === "inline", [variant])
        const { styles, theme } = useThemedStyles(baseStyles(isInline, statusVariant))
        const colors = theme.colors[statusVariant]

        return (
            <BaseView style={[styles.container, style]} justifyContent={justifyContent}>
                <BaseView style={[styles.row, contentStyle]} justifyContent={justifyContent}>
                    <BaseIcon name={ICON_NAMES[status]} size={16} color={colors.icon} />
                    <BaseText
                        typographyFont="captionRegular"
                        color={isInline ? colors.titleInline : colors.title}
                        align={textAlign}>
                        {message}
                    </BaseText>
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (isInline: boolean, status: StatusColorVariant) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: isInline ? 0 : 12,
            paddingVertical: isInline ? 0 : 8,
            backgroundColor: isInline ? theme.colors.transparent : theme.colors[status].background,
            borderRadius: isInline ? 0 : 6,
        },
        row: {
            flex: 1,
            gap: 8,
            flexDirection: "row",
            alignItems: "flex-start",
        },
    })
