import { StyleSheet } from "react-native"
import React, { useState } from "react"
import Animated from "react-native-reanimated"
import { AnimatedFilterChips } from "../../../AnimatedFilterChips"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { useI18nContext } from "~i18n"

type FilterItem = "recent" | "accounts" | "contacts"

const FILTER_ITEMS: FilterItem[] = ["recent", "accounts", "contacts"]

export const KnownAddressesList = () => {
    const [selectedItem, setSelectedItem] = useState<FilterItem>("recent")

    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    return (
        <Animated.View style={styles.root}>
            <AnimatedFilterChips
                items={FILTER_ITEMS}
                selectedItem={selectedItem}
                scrollEnabled={false}
                containerStyle={styles.filterContainer}
                contentContainerStyle={styles.filterContentContainer}
                keyExtractor={item => item}
                getItemLabel={item => LL[`SEND_RECEIVER_FILTER_${item.toUpperCase() as Uppercase<FilterItem>}`]()}
                onItemPress={item => {
                    setSelectedItem(item)
                }}
            />
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flexDirection: "column",
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE,
            borderRadius: 16,
            padding: 24,
            gap: 16,
        },
        filterContainer: {
            flex: 1,
        },
        filterContentContainer: {
            flex: 1,
            justifyContent: "space-between",
        },
    })
