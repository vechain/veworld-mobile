import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { BaseIconV2, BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { AlertStatus, ICON_NAMES, StatusColorVariant } from "~Components/Reusable/Alert/utils/AlertConfigs"
import { ColorThemeType } from "~Constants"

interface AlertCardProps {
    title: string
    message: string
    status: AlertStatus
}

export const AlertCard = memo(({ title, message, status }: AlertCardProps) => {
    const statusVariant = StatusColorVariant[status]
    const { styles, theme } = useThemedStyles(baseStyles(statusVariant))
    const colors = theme.colors[`${status}Variant`]

    return (
        <BaseView style={styles.container}>
            <BaseView style={styles.head}>
                <BaseIconV2 name={ICON_NAMES[status]} size={16} color={colors.icon} />
                <BaseSpacer width={8} />
                <BaseText typographyFont="bodyMedium" color={colors.title}>
                    {title}
                </BaseText>
            </BaseView>
            <BaseSpacer height={4} />
            <BaseText
                typographyFont="captionRegular"
                color={theme.colors.alertDescription}
                style={styles.textContainer}>
                {message}
            </BaseText>
        </BaseView>
    )
})

const baseStyles = (status: StatusColorVariant) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "column",
            backgroundColor: theme.colors[status].background,
            borderColor: theme.colors[status].border,
            borderRadius: 8,
            borderWidth: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        head: {
            flexDirection: "row",
            alignItems: "flex-start",
            paddingRight: 16,
        },
        content: {
            flexDirection: "column",
            alignItems: "flex-start",
        },
        textContainer: {
            paddingLeft: 24,
        },
    })
