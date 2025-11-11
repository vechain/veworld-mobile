import { BottomTabBarHeightCallbackContext, BottomTabBarProps } from "@react-navigation/bottom-tabs"
import React, { useContext, useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, { runOnJS, SharedValue, useAnimatedReaction, useAnimatedStyle } from "react-native-reanimated"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import PlatformUtils from "~Utils/PlatformUtils"

type Props = BottomTabBarProps & {
    /**
     * Height multiplier (can go from 0 to 1).
     * 1 is shown, 0 is hidden.
     */
    heightMultiplier: SharedValue<number>
}

const useSafeContext = () => {
    const setHeight = useContext(BottomTabBarHeightCallbackContext)
    if (!setHeight) throw new Error("[useSafeContext]: setHeight is not defined.")
    return setHeight
}

export const TabBar = ({ state, descriptors, navigation, heightMultiplier }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    const baseHeight = useMemo(() => (PlatformUtils.isIOS() ? 90 : 56), [])

    const setHeight = useSafeContext()

    const animatedStyles = useAnimatedStyle(() => {
        return {
            height: heightMultiplier.value * baseHeight,
            paddingVertical: heightMultiplier.value * 8,
        }
    }, [heightMultiplier.value, baseHeight])

    useAnimatedReaction(
        () => heightMultiplier.value,
        current => {
            runOnJS(setHeight)(current)
        },
    )

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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        tabbar: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTopWidth: 0,
            paddingHorizontal: 16,
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            backgroundColor: theme.colors.card,
            display: "flex",
            flexDirection: "row",
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
