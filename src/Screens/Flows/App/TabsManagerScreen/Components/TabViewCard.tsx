import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import Animated from "react-native-reanimated"
import { BaseIcon, BaseText, BaseView } from "~Components"
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
                    <View style={styles.headerText}>
                        {tab.favicon ? (
                            <FastImage source={{ uri: tab.favicon }} style={styles.headerFavicon as ImageStyle} />
                        ) : (
                            <BaseView style={[styles.headerFavicon, styles.headerFaviconNotFound]}>
                                <BaseIcon name="icon-globe" size={8} color={COLORS.GREY_400} />
                            </BaseView>
                        )}
                        <BaseText typographyFont="bodySemiBold" color={"white"} numberOfLines={1}>
                            {tab.title}
                        </BaseText>
                    </View>
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose} activeOpacity={0.8}>
                        <BaseIcon name="icon-x" size={16} color={"white"} />
                    </TouchableOpacity>
                </View>
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
            height: 194,
            minWidth: 148,
            borderRadius: 12,
            borderStyle: "solid",
            borderWidth: 1,
            backgroundColor: theme.colors.tabsFooter.background,
            borderColor: theme.colors.tabsFooter.border,
            overflow: "hidden",
        },
        selected: {
            borderColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
            borderWidth: 3,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE_90_TRANSPARENT : COLORS.PURPLE_RGBA_TRANSPARENT,
        },
        headerText: {
            flex: 0.8,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingLeft: 8,
            paddingVertical: 8,
        },
        headerFavicon: {
            width: 16,
            height: 16,
            borderRadius: 4,
        },
        headerFaviconNotFound: {
            padding: 4,
            backgroundColor: COLORS.GREY_200,
        },
        closeIcon: {
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
        image: {
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: 8,
        },
    })
}
