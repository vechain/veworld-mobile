import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs"
import React from "react"
import { StyleSheet } from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

export const DiscoverTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    const { styles } = useThemedStyles(baseStyles(state.routes.length))

    const animatedIndicatorStyles = useAnimatedStyle(() => {
        const increment = Math.floor(100 / state.routes.length)
        return {
            left: `${state.index * increment}%`,
        }
    }, [])

    return (
        <BaseView flexDirection="row">
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key]
                const label = options?.title ?? route.name

                const isFocused = state.index === index

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    })

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params)
                    }
                }

                return (
                    <BaseTouchable style={styles.tabElement} key={route.name} onPress={onPress}>
                        <BaseText>{label}</BaseText>
                    </BaseTouchable>
                )
            })}

            <Animated.View style={[styles.indicator, animatedIndicatorStyles]} />
        </BaseView>
    )
}

const baseStyles = (tabsLength: number) => (theme: ColorThemeType) => {
    return StyleSheet.create({
        indicator: {
            position: "absolute",
            bottom: "100%",
            width: `${Math.floor(100 / tabsLength)}%`,
            height: 2,
            backgroundColor: theme.isDark ? theme.colors.secondary : theme.colors.primary,
        },
        tabElement: {
            width: `${Math.floor(100 / tabsLength)}%`,
        },
    })
}
