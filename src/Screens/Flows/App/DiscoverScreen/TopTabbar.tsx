import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs"
import React from "react"
import { Pressable, StyleSheet, Animated } from "react-native"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { BaseText, BaseView } from "~Components"

export const TopTabbar = ({
    state,
    descriptors,
    navigation,
    position,
}: MaterialTopTabBarProps) => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView flexDirection="row">
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
                        // The `merge: true` option makes sure that the params inside the tab screen are preserved
                        navigation.navigate({
                            name: route.name,
                            params: undefined,
                            merge: true,
                        })
                    }
                }

                const inputRange = state.routes.map((_, i) => i)
                const opacity = position.interpolate({
                    inputRange,
                    outputRange: inputRange.map(i => (i === index ? 1 : 0)),
                })

                return (
                    <Pressable
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        onPress={onPress}
                        style={styles.buttonContainer}>
                        <BaseView alignItems="center">
                            <BaseText typographyFont={"subTitleLight"}>
                                {route.name}
                            </BaseText>

                            <Animated.Text
                                style={{
                                    opacity,
                                    ...styles.underline,
                                }}
                            />
                        </BaseView>
                    </Pressable>
                )
            })}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        buttonContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        underline: {
            marginTop: 4,
            backgroundColor: theme.isDark ? COLORS.GRAY : COLORS.DARK_PURPLE,
            height: 4,
            width: 12,
            borderRadius: 2,
            overflow: "hidden",
        },
    })
