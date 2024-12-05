import React from "react"
import { StyleSheet } from "react-native"
import { BaseIconV2, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { DesignSystemIconMap } from "~Assets"

type BackupStatusVariant = "success" | "error" | "neutral"

enum StatusColorVariant {
    "success" = "successVariant",
    "error" = "errorVariant",
    "neutral" = "neutralVariant",
}

const ICON_NAMES: Record<BackupStatusVariant, keyof typeof DesignSystemIconMap> = {
    success: "icon-check-circle-2",
    error: "icon-x-circle",
    neutral: "icon-info",
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
    testID?: string
}

export const WalletBackupStatusRow = ({
    variant,
    icon,
    title,
    rightElement,
    onPress,
    disabled = false,
    loading = false,
    testID,
}: Props) => {
    const statusVariant = StatusColorVariant[variant]
    const { styles, theme } = useThemedStyles(baseStyles(statusVariant))
    const colors = theme.colors[statusVariant]
    return (
        <BaseTouchableBox
            testID={testID}
            containerStyle={[styles.container]}
            style={styles.content}
            disabled={disabled || loading}
            action={onPress}>
            <BaseView style={styles.info}>
                <BaseIconV2 name={ICON_NAMES[variant]} size={icon?.size ?? 16} color={colors.icon} />
                <BaseView w={12} />
                <BaseText typographyFont="body" color={variant === "neutral" ? COLORS.GREY_600 : COLORS.DARK_PURPLE}>
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
