import { useNavigation, useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import Animated, { useAnimatedRef } from "react-native-reanimated"
import { AnimatedFloatingButton, BaseSpacer, BaseView, Layout } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useBrowserSearch, useFetchFeaturedDApps, useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import {
    selectBookmarkedDapps,
    selectFeaturedDapps,
    selectHasUserOpenedDiscovery,
    setDiscoverySectionOpened,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { URIUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { Ecosystem, Favourites, Header, NewDapps } from "./Components"
import { groupFavoritesByBaseUrl } from "./utils"
import { VeBetterDAOCarousel } from "./Components/VeBetterDAOCarousel"
import { PopularTrendingDApps } from "./Components/PopularTrendingDApps"
import { useDAppActions } from "./Hooks"
export const DiscoverScreen: React.FC = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { styles } = useThemedStyles(baseStyles)

    useFetchFeaturedDApps()
    const { navigateToBrowser } = useBrowserSearch()

    const animatedRef = useAnimatedRef<Animated.ScrollView>()

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const hasOpenedDiscovery = useAppSelector(selectHasUserOpenedDiscovery)
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const dapps = useAppSelector(selectFeaturedDapps)
    const { onDAppPress } = useDAppActions()

    const [filteredSearch, setFilteredSearch] = useState("")
    const groupedbookmarkedDApps = useMemo(() => groupFavoritesByBaseUrl(bookmarkedDApps), [bookmarkedDApps])
    const showFavorites = groupedbookmarkedDApps.length > 0

    useEffect(() => {
        if (!hasOpenedDiscovery) {
            track(AnalyticsEvent.DISCOVERY_SECTION_OPENED)
            dispatch(setDiscoverySectionOpened())
        }
    }, [track, hasOpenedDiscovery, dispatch])

    const isWebSearchFloatingButtonVisible = useMemo(() => {
        return !!filteredSearch.length
    }, [filteredSearch.length])

    const onSearch = useCallback(() => {
        if (!filteredSearch.length) return

        Keyboard.dismiss()

        const dapp = dapps.find(item => {
            return URIUtils.getHostName(item.href)?.toLowerCase() === filteredSearch.toLowerCase()
        })

        navigateToBrowser(dapp?.href ?? filteredSearch)
        setFilteredSearch("")
    }, [dapps, filteredSearch, navigateToBrowser])

    const onSeeAllPress = useCallback(() => nav.navigate(Routes.DISCOVER_FAVOURITES), [nav])

    return (
        <Layout
            fixedHeader={<Header />}
            noBackButton
            hasSafeArea
            fixedBody={
                <BaseView style={styles.rootContainer}>
                    <Animated.ScrollView
                        ref={animatedRef}
                        style={styles.scrollView}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}>
                        <BaseSpacer height={24} />
                        <VeBetterDAOCarousel />

                        <BaseSpacer height={40} />
                        {showFavorites && (
                            <>
                                <Favourites
                                    bookmarkedDApps={groupedbookmarkedDApps}
                                    onActionLabelPress={onSeeAllPress}
                                    onDAppPress={onDAppPress}
                                />
                                <BaseSpacer height={48} />
                            </>
                        )}

                        {/* New Dapps */}
                        <NewDapps />
                        <BaseSpacer height={48} />

                        {/* Trending & Popular */}
                        <PopularTrendingDApps />
                        <BaseSpacer height={48} />

                        <Ecosystem title={LL.DISCOVER_ECOSYSTEM()} dapps={dapps} />
                        {isWebSearchFloatingButtonVisible && <BaseSpacer height={70} />}
                    </Animated.ScrollView>
                    <AnimatedFloatingButton
                        title={LL.DISCOVER_WEB_SEARCH_FLOATING_BUTTON_LABEL()}
                        isVisible={isWebSearchFloatingButtonVisible}
                        onPress={onSearch}
                    />
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
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
    })
