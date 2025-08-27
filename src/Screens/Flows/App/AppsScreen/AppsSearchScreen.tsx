import React, { useCallback, useState } from "react"
import { Platform, StyleSheet } from "react-native"
import { BaseIcon, BaseStatusBar, BaseText, BaseTouchable, BaseView, Layout, useFeatureFlags } from "~Components"
import { SearchError, useBrowserNavigation, useBrowserSearch, useThemedStyles } from "~Hooks"
import { SearchBar } from "./Components/SearchBar"
import { SearchResults } from "./Components/SearchResults"
import { COLORS, ColorThemeType } from "~Constants"
import { selectTabs, useAppSelector } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"

export const AppsSearchScreen = () => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const [search, setSearch] = useState("")
    const [error, setError] = useState<SearchError>()
    const { results, isValidQuery } = useBrowserSearch(search)
    const { navigateToBrowser } = useBrowserNavigation()
    const nav = useNavigation()
    const tabs = useAppSelector(selectTabs)
    const { betterWorldFeature } = useFeatureFlags()

    const onSearchUpdated = useCallback(
        (value: string) => {
            if (typeof error !== "undefined") setError(undefined)
            setSearch(value)
        },
        [error],
    )

    const onSearchReturn = useCallback(
        async (value: string) => {
            const result = await navigateToBrowser(value)
            if (typeof result !== "undefined") setError(result)
        },
        [navigateToBrowser],
    )

    const onNavigateToTabs = useCallback(() => {
        if (betterWorldFeature.appsScreen.enabled) {
            nav.navigate(Routes.APPS_TABS_MANAGER)
        } else {
            nav.navigate(Routes.DISCOVER_TABS_MANAGER)
        }
    }, [betterWorldFeature.appsScreen.enabled, nav])

    const onClose = useCallback(() => {
        const routes = nav.getState()?.routes
        const previousRoute = routes?.[routes.length - 2]
        if (betterWorldFeature.appsScreen.enabled && previousRoute?.name === Routes.APPS_SEARCH) {
            nav.navigate(Routes.APPS)
        } else if (!betterWorldFeature.appsScreen.enabled && previousRoute?.name === Routes.DISCOVER_SEARCH) {
            nav.navigate(Routes.DISCOVER)
        } else {
            nav.goBack()
        }
    }, [betterWorldFeature.appsScreen.enabled, nav])

    return (
        <Layout
            bg={COLORS.DARK_PURPLE}
            noBackButton
            noMargin
            fixedBody={
                <KeyboardAvoidingView
                    behavior="padding"
                    style={styles.rootContainer}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 38 : 8}>
                    {Platform.OS === "ios" && <BaseStatusBar hero={true} />}
                    <SearchResults
                        error={error}
                        results={results.data}
                        isValidQuery={isValidQuery}
                        isExactMatch={results.isExactMatch}
                    />

                    <BaseView style={styles.footerContainer}>
                        <BaseTouchable style={styles.tabsContainer} action={onClose}>
                            <BaseIcon
                                name={"icon-x"}
                                size={16}
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                            />
                        </BaseTouchable>

                        <SearchBar filteredSearch={search} onTextChange={onSearchUpdated} onSubmit={onSearchReturn} />
                        <BaseTouchable style={styles.tabsContainer} action={onNavigateToTabs}>
                            <BaseText
                                typographyFont="captionSemiBold"
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}>
                                {tabs.length}
                            </BaseText>
                        </BaseTouchable>
                    </BaseView>
                    <BaseView p={4} />
                </KeyboardAvoidingView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 24,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        keyboardAvoidingView: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            paddingBottom: 16,
        },
        footerContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 24,
            marginBottom: 16,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        tabsContainer: {
            width: 32,
            height: 32,
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
            borderRadius: 100,
            alignItems: "center",
            justifyContent: "center",
        },
    })
