import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { AlertStatus, ICON_NAMES } from "~Components/Reusable/Alert/utils/AlertConfigs"

interface AlertCardProps {
    title: string
    message: string
    status: AlertStatus
}

export const AlertCard = memo(({ title, message, status }: AlertCardProps) => {
    const theme = useTheme()
    const colors = theme.colors[`${status}Variant`]

    const containerStyle = {
        ...styles.container,
        backgroundColor: colors.background,
        borderColor: colors.border,
    }

    return (
        <BaseSpacer style={containerStyle}>
            <BaseView style={styles.head}>
                <BaseIcon name={ICON_NAMES[status]} size={16} color={colors.icon} />
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
        </BaseSpacer>
    )
})

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    head: {
        flexDirection: "row",
        alignItems: "center",
    },
    content: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    textContainer: {
        paddingLeft: 24,
    },
})
