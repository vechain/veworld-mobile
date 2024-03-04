import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs"
import * as React from "react"
import { TouchableOpacity, StyleSheet } from "react-native"
import { BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { PlatformUtils } from "~Utils"

export const TabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView
            w={100}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-evenly"
            style={styles.tabBar}
            pb={16}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key]
                const label = options.title ?? route.name ?? ""

                const isFocused = state.index === index

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    })

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name)
                    }
                }

                if (PlatformUtils.isIOS()) return

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.tab}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}>
                        <BaseText pb={4} typographyFont={isFocused ? "buttonPrimary" : "buttonSecondary"}>
                            {label}
                        </BaseText>
                        <BaseView
                            style={[styles.tabTick, isFocused ? styles.tabTickFocussed : styles.tabTickUnfocussed]}
                        />
                    </TouchableOpacity>
                )
            })}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        tabBar: {
            alignItems: "center",
            backgroundColor: theme.colors.background,
        },
        tab: {
            alignItems: "center",
        },
        tabTick: {
            backgroundColor: theme.colors.background,
            height: 3,
            width: 8,
            borderRadius: 2,
        },
        tabTickUnfocussed: {
            backgroundColor: theme.colors.background,
        },
        tabTickFocussed: {
            backgroundColor: theme.colors.text,
        },
    })
