import React, { FC, memo } from "react"
import { StyleSheet, View } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseView } from "~Components/Base"

type Props = {
    focused: boolean
    title: string
}

export const TabIcon: FC<Props> = memo(({ focused, title }) => {
    const { styles } = useThemedStyles(baseStyles(focused))

    return (
        <BaseView justify="center" align="center" style={styles.container}>
            <Icon
                name={title.toLowerCase()}
                size={24}
                color={styles.icon.color}
            />

            <View style={styles.dot} />
        </BaseView>
    )
})

const baseStyles = (isFocused: boolean) => (theme: ColorThemeType) => {
    const iconColor = () => {
        if (isFocused)
            return theme.isDark ? theme.colors.tertiary : theme.colors.primary
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
        },
        dot: {
            height: 4,
            width: 4,
            backgroundColor: isFocused ? iconColor() : "transparent",
            borderRadius: 4,
            marginTop: 1,
        },
    })
}
