import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs"
import React from "react"
import { ScrollView, StyleSheet } from "react-native"
import { BaseChip, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"

export const ActivityTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    const { styles } = useThemedStyles(baseStyle)

    return (
        <BaseView>
            <ScrollView
                horizontal
                contentContainerStyle={styles.filterContainer}
                showsHorizontalScrollIndicator={false}>
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

                    return <BaseChip key={label} label={label} active={isFocused} onPress={onPress} />
                })}
            </ScrollView>
        </BaseView>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        rootContainer: {
            minWidth: 64,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            alignItems: "center",
        },
        filterContainer: {
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
        },
    })
