import React, { FC, memo, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { useThemedStyles } from "~Common"
import { BaseView } from "~Components/Base"
import { ThemeType } from "~Model"

type Props = {
    focused: boolean
    title: string
}

export const TabIcon: FC<Props> = memo(({ focused, title }) => {
    const { styles } = useThemedStyles(baseStyles(focused))

    const iconName = useMemo(
        () =>
            focused
                ? title.toLocaleLowerCase()
                : `${title.toLocaleLowerCase()}-outline`,
        [focused, title],
    )

    return (
        <BaseView justify="center" align="center" style={styles.container}>
            <Icon name={iconName} size={24} color={styles.icon.color} />

            <View style={styles.dot} />
        </BaseView>
    )
})

const baseStyles = (isFocused: boolean) => (theme: ThemeType) => {
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
