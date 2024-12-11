import React, { FC, memo } from "react"
import { StyleSheet, TextStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { BaseView } from "~Components/Base"
import { Icon } from "~Components/Reusable/DesignSystemIconSet"
import { IconKey } from "~Model"

type Props = {
    focused: boolean
    title: IconKey
    isSettings: boolean
    isShowBackupModal: boolean
}

export const TabIcon: FC<Props> = memo(({ focused, title, isSettings, isShowBackupModal }) => {
    const { styles } = useThemedStyles(baseStyles(focused))

    return (
        <BaseView justifyContent="center" alignItems="center" style={styles.container}>
            {isSettings && isShowBackupModal && <BaseView style={styles.warningLabel} />}

            <Icon name={title} size={20} color={(styles.icon as TextStyle).color} />
        </BaseView>
    )
})

const baseStyles = (isFocused: boolean) => (theme: ColorThemeType) => {
    const iconColor = () => {
        if (isFocused) return theme.isDark ? COLORS.WHITE : theme.colors.textReversed
        return theme.colors.text
    }

    const bgColor = isFocused ? COLORS.DARK_PURPLE : "transparent"
    return StyleSheet.create({
        icon: {
            color: iconColor(),
        },
        container: {
            borderRadius: 8,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: bgColor,
            position: "relative",
        },
        warningLabel: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.danger,
            position: "absolute",
            top: 6,
            right: 6,
        },
    })
}
