import React, { FC, memo } from "react"
import { StyleSheet, TextStyle } from "react-native"
import { BaseText, BaseView } from "~Components/Base"
import { Icon } from "~Components/Reusable/DesignSystemIconSet"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"
import { Spinner } from "./Spinner"

type Props = {
    focused: boolean
    title: IconKey
    label: string
    isSettings: boolean
    isShowBackupModal: boolean
}

export const TabIcon: FC<Props> = memo(({ focused, title, label, isSettings, isShowBackupModal }) => {
    const { styles } = useThemedStyles(baseStyles(focused))

    return (
        <BaseView justifyContent="center" alignItems="center" style={styles.container}>
            {isSettings && isShowBackupModal && <BaseView style={styles.warningLabel} />}
            <Icon name={title} size={20} color={(styles.icon as TextStyle).color} />
            <BaseText typographyFont="smallCaptionSemiBold" style={styles.label}>
                {label}
            </BaseText>
        </BaseView>
    )
})

export const AnimatedTabIcon: FC<Props & { isLoading?: boolean }> = memo(
    ({ focused, title, label, isSettings, isShowBackupModal, isLoading }) => {
        const { styles, theme } = useThemedStyles(baseStyles(focused))

        return (
            <BaseView justifyContent="center" alignItems="center" style={styles.container}>
                {isSettings && isShowBackupModal && <BaseView style={styles.warningLabel} />}
                {isLoading ? (
                    <Spinner color={theme.isDark ? COLORS.LIME_GREEN : theme.colors.text} size={20} />
                ) : (
                    <Icon name={title} size={20} color={(styles.icon as TextStyle).color} />
                )}

                <BaseText typographyFont="smallCaptionSemiBold" style={styles.label}>
                    {label}
                </BaseText>
            </BaseView>
        )
    },
)

const baseStyles = (isFocused: boolean) => (theme: ColorThemeType) => {
    const iconColor = () => {
        if (isFocused) return theme.isDark ? COLORS.LIME_GREEN : theme.colors.text
        return theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500
    }

    return StyleSheet.create({
        icon: {
            color: iconColor(),
        },
        container: {
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 8,
            backgroundColor: "transparent",
            position: "relative",
            gap: 4,
        },
        label: {
            color: iconColor(),
        },
        warningLabel: {
            width: 5,
            height: 5,
            borderRadius: 4,
            backgroundColor: COLORS.RED_500,
            position: "absolute",
            top: 8,
            right: 2,
        },
    })
}
