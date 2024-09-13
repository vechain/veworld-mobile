import React, { FC, memo } from "react"
import { StyleSheet, TextStyle } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseView } from "~Components/Base"

type Props = {
    focused: boolean
    title: string
    isSettings: boolean
    isShowBackupModal: boolean
}

export const TabIcon: FC<Props> = memo(({ focused, title, isSettings, isShowBackupModal }) => {
    const { styles } = useThemedStyles(baseStyles(focused))

    return (
        <BaseView justifyContent="center" alignItems="center" style={styles.container}>
            {isSettings && isShowBackupModal && <BaseView style={styles.warningLabel} />}

            <Icon name={title.toLowerCase()} size={24} color={(styles.icon as TextStyle).color} />
        </BaseView>
    )
})

const baseStyles = (isFocused: boolean) => (theme: ColorThemeType) => {
    const iconColor = () => {
        if (isFocused) return theme.isDark ? theme.colors.tertiary : theme.colors.primary
        return theme.colors.primary
    }

    const bgColor = isFocused ? theme.colors.secondary : "transparent"
    return StyleSheet.create({
        icon: {
            color: iconColor(),
        },
        container: {
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8.5,
            backgroundColor: bgColor,
            position: "relative",
        },
        dot: {
            height: 4,
            width: 4,
            backgroundColor: isFocused ? iconColor() : "transparent",
            borderRadius: 4,
            marginTop: 1,
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
