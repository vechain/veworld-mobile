import { useNavigation, useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Keyboard, Linking, StyleSheet } from "react-native"
import Animated, { useAnimatedRef, useScrollViewOffset } from "react-native-reanimated"
import { randomized as daoDapps } from "~Assets"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useBrowserSearch, useThemedStyles, useVisitedUrls } from "~Hooks"
import { RumManager } from "~Logging/RumManager"
import { Routes } from "~Navigation"
import {
    addNavigationToDApp,
    selectBookmarkedDapps,
    selectFeaturedDapps,
    selectHasUserOpenedDiscovery,
    setDiscoverySectionOpened,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { AnimatedSearchBar } from "./Components/AnimatedSearchBar"
import { AnimatedTitle } from "./Components/AnimatedTitle"
import { Ecosystem } from "./Components/Ecosystem"
import { Favourites } from "./Components/Favourites"
import { MakeYourOwnDApp } from "./Components/MakeYourOwnDApp"
import { VeBetterDAODApps } from "./Components/VeBetterDAODapps"
import { VeBetterDAOMainCard } from "./Components/VeBetterDAOMainCard"
import { WebSearchFloatingButton } from "./Components/WebSearchFloatingButton"
import { useFetchFeaturedDApps } from "./Hooks/useFetchFeaturedDApps"

const DAO_URL = "https://governance.vebetterdao.org/"

export const DiscoverScreen: React.FC = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { styles, theme } = useThemedStyles(baseStyles)
    const ddLogger = useMemo(() => new RumManager(), [])

    const { addVisitedUrl } = useVisitedUrls()

    useFetchFeaturedDApps()
    const { navigateToBrowser } = useBrowserSearch()

    const animatedRef = useAnimatedRef<Animated.ScrollView>()
    const offset = useScrollViewOffset(animatedRef)

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const hasOpenedDiscovery = useAppSelector(selectHasUserOpenedDiscovery)
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const dapps = useAppSelector(selectFeaturedDapps)

    const [filteredSearch, setFilteredSearch] = useState("")
    const showFavorites = bookmarkedDApps.length > 0

    useEffect(() => {
        if (!hasOpenedDiscovery) {
            track(AnalyticsEvent.DISCOVERY_SECTION_OPENED)
            dispatch(setDiscoverySectionOpened())
            ddLogger.logAction("DISCOVERY_SECTION", "DISCOVERY_SECTION_OPENED")
        }
    }, [track, hasOpenedDiscovery, dispatch, ddLogger])

    const onDAppPress = useCallback(
        ({ href, custom }: { href: string; custom?: boolean }) => {
            nav.navigate(Routes.BROWSER, { url: href })

            addVisitedUrl(href)

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: href,
            })

            ddLogger.logAction("DISCOVERY_SECTION", "DISCOVERY_USER_OPENED_DAPP")

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: custom ?? false }))
            }, 1000)
        },
        [nav, addVisitedUrl, track, ddLogger, dispatch],
    )

    const onTextChange = useCallback((_text: string) => {
        setFilteredSearch(_text)
    }, [])

    const isWebSearchFloatingButtonVisible = useMemo(() => {
        return !!filteredSearch.length
    }, [filteredSearch.length])

    const onSearch = useCallback(() => {
        if (!filteredSearch) return
        Keyboard.dismiss()
        setFilteredSearch("")
        setTimeout(() => navigateToBrowser(filteredSearch), 300)
    }, [filteredSearch, navigateToBrowser])

    const onMakeYourOwnDAppPress = useCallback(async () => {
        const url = process.env.REACT_APP_CREATE_YOUR_VECHAIN_DAPP_URL
        if (url && (await Linking.canOpenURL(url))) {
            Linking.openURL(url)
        }
    }, [])

    const onNavigateToBrowserHistory = useCallback(() => {
        nav.navigate(Routes.DISCOVER_BROWSER_HISTORY)
    }, [nav])

    const onSeeAllPress = useCallback(() => nav.navigate(Routes.DISCOVER_FAVOURITES), [nav])

    const renderScreenHeader = useMemo(() => {
        return (
            <>
                <AnimatedTitle title={LL.DISCOVER_TITLE()} scrollOffset={offset} />
                <BaseSpacer height={12} />
                <AnimatedSearchBar
                    placeholder={LL.DISCOVER_SEARCH()}
                    value={filteredSearch}
                    iconName={"history"}
                    iconColor={theme.colors.primary}
                    onTextChange={onTextChange}
                    onIconPress={onNavigateToBrowserHistory}
                />
                <BaseSpacer height={12} />
            </>
        )
    }, [LL, filteredSearch, offset, onNavigateToBrowserHistory, onTextChange, theme.colors.primary])

    return (
        <Layout
            fixedHeader={renderScreenHeader}
            noBackButton
            noMargin
            hasSafeArea
            fixedBody={
                <BaseView style={styles.rootContainer}>
                    <Animated.ScrollView
                        ref={animatedRef}
                        style={styles.scrollView}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}>
                        <BaseSpacer height={24} />
                        <VeBetterDAOMainCard href={DAO_URL} onDAppPress={onDAppPress} />
                        <BaseSpacer height={36} />
                        <VeBetterDAODApps
                            title={LL.DISCOVER_DAPPS_TITLE()}
                            daoDapps={daoDapps}
                            onDAppPress={onDAppPress}
                        />
                        <BaseSpacer height={36} />
                        <MakeYourOwnDApp label={LL.DISCOVER_CREATE_YOUR_DAPP()} onPress={onMakeYourOwnDAppPress} />
                        <BaseSpacer height={36} />
                        {showFavorites && (
                            <>
                                <Favourites
                                    title={LL.DISCOVER_TAB_FAVOURITES()}
                                    actionLabel={LL.DISCOVER_SEE_ALL_BOOKMARKS()}
                                    bookmarkedDApps={bookmarkedDApps}
                                    onActionLabelPress={onSeeAllPress}
                                    onDAppPress={onDAppPress}
                                />
                                <BaseSpacer height={36} />
                            </>
                        )}
                        <Ecosystem title={LL.DISCOVER_ECOSYSTEM()} dapps={dapps} onDAppPress={onDAppPress} />
                        {isWebSearchFloatingButtonVisible && <BaseSpacer height={50} />}
                    </Animated.ScrollView>
                    <WebSearchFloatingButton isVisible={isWebSearchFloatingButtonVisible} onPress={onSearch} />
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flexGrow: 1,
        },
        scrollView: {
            flex: 1,
        },
        popUpContainer: {
            position: "absolute",
            bottom: -100,
            left: 0,
            right: 0,
            zIndex: 2,
        },
        paddingTop: {
            paddingTop: 24,
        },
    })
