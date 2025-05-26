import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native"
import Animated from "react-native-reanimated"
import { BaseIcon, BaseText } from "~Components"
import { COLORS, ColorThemeType, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import { closeTab, selectCurrentTabId, setCurrentTab, Tab, useAppDispatch, useAppSelector } from "~Storage/Redux"

type TabViewCardProps = {
    tab: Tab
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export const TabViewCard = ({ tab }: TabViewCardProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListBrowser>>()
    const selectedTabId = useAppSelector(selectCurrentTabId)

    const dispatch = useAppDispatch()

    const onPress = useCallback(() => {
        dispatch(setCurrentTab(tab.id))
        nav.replace(Routes.BROWSER, { url: tab.href })
    }, [dispatch, tab.id, tab.href, nav])

    const onClose = useCallback(() => {
        dispatch(closeTab(tab.id))
    }, [dispatch, tab.id])

    return (
        <AnimatedTouchableOpacity
            style={[styles.container, tab.id === selectedTabId && styles.selected]}
            onPress={onPress}>
            <ImageBackground source={{ uri: tab.preview }} resizeMode="cover" style={[styles.image]}>
                <View style={styles.header}>
                    <BaseText typographyFont="bodySemiBold" color={"white"} numberOfLines={1} flexGrow={1}>
                        {tab.title}
                    </BaseText>
                </View>
                <TouchableOpacity style={styles.footer} onPress={onClose} activeOpacity={0.8}>
                    <BaseIcon name="icon-x" size={16} color={"white"} />
                </TouchableOpacity>
            </ImageBackground>
        </AnimatedTouchableOpacity>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    // Calculate card dimensions for a square grid with 2 items per row
    const cardSize = (SCREEN_WIDTH - 64) / 2 // 64 = horizontal padding (24*2) + gap (16)

    return StyleSheet.create({
        container: {
            width: cardSize,
            height: 188,
            minWidth: 148,
            borderRadius: 12,
            borderWidth: 3,
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.background,
            overflow: "hidden",
        },
        selected: {
            borderColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_400,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#202226BF",
            paddingHorizontal: 12,
            paddingVertical: 10,
        },
        image: {
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: 8,
        },
        footer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#202226BF",
            paddingHorizontal: 12,
            paddingVertical: 10,
        },
        footerButton: {
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            justifyContent: "center",
        },
    })
}
