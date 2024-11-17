import { COLORS } from "~Constants"
import { StyleSheet, ViewStyle } from "react-native"

export type AlertStatus = "error" | "success"

export type AlertStyles = {
    container: ViewStyle
    icon: {
        name: string
        color: string
    }
    colors: {
        title: string
        description: string
        background: string
        border?: string
    }
}

const ALERT_CONFIGS = {
    success: {
        icon: {
            name: "check-circle-outline",
            color: COLORS.GREEN_500,
        },
        colors: {
            title: COLORS.GREEN_700,
            description: COLORS.GREY_600,
            background: COLORS.GREEN_50,
            border: COLORS.GREEN_200,
        },
    },
    error: {
        icon: {
            name: "alert-outline",
            color: COLORS.RED_500,
        },
        colors: {
            title: COLORS.RED_700,
            description: COLORS.GREY_600,
            background: COLORS.RED_50,
            border: COLORS.RED_200,
        },
    },
}

export const generateAlertStyles = (status: AlertStatus, variant: "card" | "inline"): AlertStyles => {
    const config = ALERT_CONFIGS[status]

    const variantStyles = StyleSheet.create({
        card: {
            borderRadius: 8,
            borderColor: config.colors.border,
            backgroundColor: config.colors.background,
            paddingLeft: 2,
            paddingRight: 4,
        },
        inline: {
            borderRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: config.colors.background,
        },
    })

    return {
        icon: {
            name: config.icon.name,
            color: config.icon.color,
        },
        colors: {
            title: config.colors.title,
            description: config.colors.description,
            background: config.colors.background,
            border: config.colors.border,
        },
        container: variantStyles[variant],
    }
}
