import React, { useCallback } from "react"
import { ImageBackground, StyleSheet, TouchableOpacity } from "react-native"
import { BaseIcon, BaseText, BaseTouchable } from "~Components"
import { COLORS, ColorThemeType, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { closeTab, selectCurrentTabId, setCurrentTab, Tab, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { RootStackParamListBrowser, Routes } from "~Navigation"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { BlurView } from "@react-native-community/blur"

type TabViewCardProps = {
    tab: Tab
}

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
        <TouchableOpacity style={[styles.container, tab.id === selectedTabId && styles.selected]} onPress={onPress}>
            <ImageBackground source={{ uri: tab.preview }} resizeMode="cover" style={[styles.image]}>
                <BlurView style={styles.header} blurAmount={10} blurType="light">
                    <BaseText color={"white"}>{tab.title}</BaseText>
                </BlurView>
                <BlurView style={styles.footer} blurAmount={10} blurType="light">
                    <BaseTouchable onPress={onClose}>
                        <BaseIcon name="icon-x" size={16} color={"white"} />
                    </BaseTouchable>
                </BlurView>
            </ImageBackground>
        </TouchableOpacity>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    // Calculate card dimensions for a square grid with 2 items per row
    const cardSize = (SCREEN_WIDTH - 64) / 2 // 64 = horizontal padding (24*2) + gap (16)

    return StyleSheet.create({
        container: {
            width: cardSize,
            height: cardSize,
            borderRadius: 8,
            borderWidth: 4,
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.background,
            overflow: "hidden",
        },
        selected: {
            borderColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_400,
        },
        header: {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            backgroundColor: "#170D45A6",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
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
            backgroundColor: "#170D45A6",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
        },
    })
}
