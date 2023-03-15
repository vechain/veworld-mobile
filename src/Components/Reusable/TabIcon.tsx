/* eslint-disable react-native/no-inline-styles */
import React, { FC, memo, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useTheme } from "~Common"
import { BaseView } from "~Components/Base"

type Props = {
    focused: boolean
    title: string
}

export const TabIcon: FC<Props> = memo(({ focused, title }) => {
    const theme = useTheme()

    const iconColor = useMemo(() => {
        if (focused) {
            return theme.isDark ? theme.colors.tertiary : theme.colors.primary
        }
        return theme.colors.primary
    }, [focused, theme.colors.primary, theme.colors.tertiary, theme.isDark])

    const bgColor = useMemo(
        () => (focused ? theme.colors.secondary : "transparent"),
        [focused, theme.colors.secondary],
    )

    return (
        <BaseView
            justify="center"
            align="center"
            style={[baseStyles.container, { backgroundColor: bgColor }]}>
            <Icon name={title.toLowerCase()} size={24} color={iconColor} />

            <View
                style={[
                    baseStyles.dot,
                    { backgroundColor: focused ? iconColor : "transparent" },
                ]}
            />
        </BaseView>
    )
})

const baseStyles = StyleSheet.create({
    container: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8.5,
    },
    dot: {
        height: 4,
        width: 4,
        borderRadius: 4,
        marginTop: 1,
    },
})
