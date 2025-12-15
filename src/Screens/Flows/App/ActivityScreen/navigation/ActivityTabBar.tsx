import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs"
import React from "react"
import { Pressable, StyleSheet, Text } from "react-native"
import { TabBar, TabBarIndicator } from "react-native-tab-view"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import FontUtils from "~Utils/FontUtils"

export const ActivityTabBar = ({ state, position, layout, jumpTo, ...tabbarProps }: MaterialTopTabBarProps) => {
    const { styles } = useThemedStyles(baseStyle)

    return (
        <TabBar
            {...tabbarProps}
            navigationState={state}
            position={position}
            layout={layout}
            jumpTo={jumpTo}
            gap={8}
            scrollEnabled={true}
            bounces={false}
            style={styles.root}
            tabStyle={styles.tabsContainer}
            contentContainerStyle={styles.contentContainer}
            renderIndicator={props => {
                return (
                    <TabBarIndicator
                        {...props}
                        width={props.getTabWidth(props.navigationState.index)}
                        style={[props.style, styles.indicator]}
                    />
                )
            }}
            renderTabBarItem={props => {
                const isFocused = props.navigationState.routes[props.navigationState.index].key === props.route.key
                const label = tabbarProps.descriptors[props.route.key]?.options.title

                return (
                    <Pressable
                        style={[styles.tab, props.style]}
                        onLayout={props.onLayout}
                        android_ripple={props.android_ripple}
                        testID={props.testID}
                        accessible={props.accessible}
                        role="tab"
                        aria-selected={isFocused}
                        unstable_pressDelay={0}
                        onPress={props.onPress}
                        onLongPress={props.onLongPress}>
                        <Text style={[styles.label, isFocused ? styles.selectedLabel : styles.unselectedLabel]}>
                            {label}
                        </Text>
                    </Pressable>
                )
            }}
        />
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: "transparent",
            marginTop: 8,
            marginBottom: 24,
        },
        contentContainer: {
            paddingHorizontal: 16,
        },
        tabsContainer: {
            width: "auto",
        },
        tab: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            minWidth: 64,
            textAlign: "center",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        label: {
            fontSize: FontUtils.font(14),
            lineHeight: FontUtils.font(18.2),
            fontWeight: "500",
        },
        selectedLabel: {
            color: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        unselectedLabel: {
            color: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600,
        },
        indicator: {
            backgroundColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
            borderRadius: 99,
            height: "100%",
            paddingHorizontal: 12,
            paddingVertical: 8,
            minWidth: 64,
        },
    })
