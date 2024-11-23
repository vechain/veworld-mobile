import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type BackupStatusVariant = "success" | "error" | "neutral"

enum StatusColorVariant {
    "success" = "successVariant",
    "error" = "errorVariant",
    "neutral" = "neutralVariant",
}

const ICON_NAMES: Record<BackupStatusVariant, string> = {
    success: "check-circle-outline",
    error: "close-circle-outline",
    neutral: "information-outline",
}

type Props = {
    variant: BackupStatusVariant
    icon?: {
        size?: number
    }
    title: string
    rightElement?: React.ReactNode
    onPress?: () => void
    disabled?: boolean
    loading?: boolean
}

export const WalletBackupStatusRow = ({
    variant,
    icon,
    title,
    rightElement,
    onPress,
    disabled = false,
    loading = false,
}: Props) => {
    const statusVariant = StatusColorVariant[variant]
    const { styles, theme } = useThemedStyles(baseStyles(statusVariant))
    const colors = theme.colors[statusVariant]
    return (
        <BaseTouchableBox
            containerStyle={[styles.container]}
            style={styles.content}
            disabled={disabled || loading}
            action={onPress}>
            <BaseView style={styles.info}>
                <BaseIcon name={ICON_NAMES[variant]} size={icon?.size || 16} color={colors.icon} />
                <BaseView w={12} />
                <BaseText
                    typographyFont="buttonSecondary"
                    color={variant === "neutral" ? COLORS.GREY_600 : COLORS.DARK_PURPLE}>
                    {title}
                </BaseText>
            </BaseView>
            <BaseView style={styles.rightElement}>{rightElement}</BaseView>
        </BaseTouchableBox>
    )
}

const baseStyles = (status: StatusColorVariant) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors[status].borderLight,
            backgroundColor: theme.colors[status].background,
            padding: 12,
        },
        content: {
            flexDirection: "row",
            alignItems: "center",
        },
        info: {
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "flex-start",
        },
        rightElement: {
            flex: 1,
            alignItems: "flex-end",
        },
    })
