import { BottomTabBarHeightCallbackContext, BottomTabBarProps } from "@react-navigation/bottom-tabs"
import React, { useContext, useEffect, useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation/Enums"
import { selectCurrentScreen, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"

type Props = BottomTabBarProps

const getHeightMultiplierByScreen = (currentScreen: string) => {
    switch (currentScreen) {
        case Routes.SETTINGS_GET_SUPPORT:
        case Routes.SETTINGS_GIVE_FEEDBACK:
        case Routes.BROWSER:
        case Routes.TOKEN_DETAILS:
        case Routes.APPS_TABS_MANAGER:
        case Routes.APPS_SEARCH:
        case Routes.BUY_WEBVIEW:
        case Routes.BUY:
        case Routes.SELECT_TOKEN_SEND:
            return 0

        case "":
            return 0

        default:
            return 1
    }
}

const useSafeContext = () => {
    const setHeight = useContext(BottomTabBarHeightCallbackContext)
    if (!setHeight) throw new Error("[useSafeContext]: setHeight is not defined.")
    return setHeight
}

export const TabBar = ({ state, descriptors, navigation }: Props) => {
    const baseHeight = useMemo(() => (PlatformUtils.isIOS() ? 84 : 56), [])

    const { styles } = useThemedStyles(baseStyles(baseHeight))
    const setHeight = useSafeContext()

    const currentScreen = useAppSelector(selectCurrentScreen)

    const heightMultiplier = useSharedValue(1)

    useEffect(() => {
        const multiplier = getHeightMultiplierByScreen(currentScreen)

        setHeight(baseHeight * multiplier)

        heightMultiplier.value = withTiming(multiplier, { duration: 400 })
    }, [currentScreen, heightMultiplier, baseHeight, setHeight])

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: interpolate(heightMultiplier.value, [1, 0], [0, baseHeight], Extrapolation.CLAMP) },
            ],
            paddingVertical: heightMultiplier.value * 8,
        }
    }, [heightMultiplier.value, baseHeight])

    return (
        <Animated.View style={[styles.tabbar, styles.shadow, animatedStyles]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key]

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

                const onLongPress = () => {
                    navigation.emit({
                        type: "tabLongPress",
                        target: route.key,
                    })
                }

                return (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabElement}
                        key={route.name}>
                        {options.tabBarIcon?.({ focused: isFocused, color: "#000000", size: 24 })}
                    </TouchableOpacity>
                )
            })}
        </Animated.View>
    )
}

const baseStyles = (baseHeight: number) => (theme: ColorThemeType) =>
    StyleSheet.create({
        tabbar: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTopWidth: 0,
            paddingHorizontal: 16,
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
            backgroundColor: theme.colors.card,
            display: "flex",
            flexDirection: "row",
            transformOrigin: "top",
            height: baseHeight,
        },
        shadow: {
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: -1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 5,
        },
        tabElement: {
            flex: 1,
        },
    })
