import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { AnimatedFilterChips } from "~Components"
import { useThemedStyles } from "~Hooks"

export const ActivityTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const getItemLabel = useCallback(
        (route: (typeof state.routes)[0]) => {
            const label = descriptors[route.key]?.options.title
            if (!label) return route.name

            return label
        },
        [descriptors, state],
    )

    const onPress = (route: (typeof state.routes)[0]) => {
        const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
        })

        const isFocused = state.routes[state.index].key === route.key

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params)
        }
    }

    return (
        <AnimatedFilterChips
            items={state.routes}
            selectedItem={state.routes[state.index]}
            keyExtractor={(item: (typeof state.routes)[0]) => item.key}
            getItemLabel={getItemLabel}
            onItemPress={onPress}
            contentContainerStyle={styles.container}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 16,
            marginBottom: 24,
        },
    })
