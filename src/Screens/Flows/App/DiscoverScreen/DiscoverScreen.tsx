import { useNavigation, useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { StyleSheet } from "react-native"
import Animated, { useAnimatedRef } from "react-native-reanimated"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useFetchFeaturedDApps, useThemedStyles, useVisitedUrls } from "~Hooks"
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
import { Ecosystem, Favourites, Header, NewDapps } from "./Components"
import { VeBetterDAOCarousel } from "./Components/VeBetterDAOCarousel"
import { groupFavoritesByBaseUrl } from "./utils"

export const DiscoverScreen: React.FC = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { styles } = useThemedStyles(baseStyles)

    const { addVisitedUrl } = useVisitedUrls()

    useFetchFeaturedDApps()

    const animatedRef = useAnimatedRef<Animated.ScrollView>()
    // const offset = useScrollViewOffset(animatedRef)

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    // const visitedUrls = useAppSelector(selectVisitedUrls)
    const hasOpenedDiscovery = useAppSelector(selectHasUserOpenedDiscovery)
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const dapps = useAppSelector(selectFeaturedDapps)

    const groupedbookmarkedDApps = useMemo(() => groupFavoritesByBaseUrl(bookmarkedDApps), [bookmarkedDApps])
    const showFavorites = groupedbookmarkedDApps.length > 0

    useEffect(() => {
        if (!hasOpenedDiscovery) {
            track(AnalyticsEvent.DISCOVERY_SECTION_OPENED)
            dispatch(setDiscoverySectionOpened())
        }
    }, [track, hasOpenedDiscovery, dispatch])

    const onDAppPress = useCallback(
        ({ href, custom }: { href: string; custom?: boolean }) => {
            nav.navigate(Routes.BROWSER, { url: href })

            addVisitedUrl(href)

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: href,
            })

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: custom ?? false }))
            }, 1000)
        },
        [nav, addVisitedUrl, track, dispatch],
    )

    const onSeeAllPress = useCallback(() => nav.navigate(Routes.DISCOVER_FAVOURITES), [nav])

    // const renderScreenHeader = useMemo(() => {
    //     return (
    //         <BaseView px={16}>
    //             <BaseView style={styles.header}>
    //                 <AnimatedTitle title={LL.DISCOVER_TITLE()} scrollOffset={offset} />
    //                 <BaseView flexDirection="row" justifyContent="space-between">
    //                     <SelectedNetworkViewer />
    //                 </BaseView>
    //             </BaseView>
    //             <BaseSpacer height={20} />
    //             <AnimatedSearchBar
    //                 placeholder={LL.DISCOVER_SEARCH()}
    //                 value={filteredSearch}
    //                 iconName={"icon-history"}
    //                 iconColor={visitedUrls.length > 0 ? theme.colors.text : theme.colors.disabledButton}
    //                 onTextChange={onTextChange}
    //                 onIconPress={onNavigateToBrowserHistory}
    //             />
    //             <BaseSpacer height={12} />
    //         </BaseView>
    //     )
    // }, [
    //     LL,
    //     filteredSearch,
    //     offset,
    //     onNavigateToBrowserHistory,
    //     onTextChange,
    //     styles.header,
    //     theme.colors.disabledButton,
    //     theme.colors.text,
    //     visitedUrls.length,
    // ])

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

                        <BaseSpacer height={18} />
                        {showFavorites && (
                            <Favourites
                                bookmarkedDApps={groupedbookmarkedDApps}
                                onActionLabelPress={onSeeAllPress}
                                onDAppPress={onDAppPress}
                            />
                        )}
                        {/* New Dapps */}
                        <NewDapps />
                        {/* Trending & Popular */}
                        <BaseSpacer height={12} />
                        <Ecosystem title={LL.DISCOVER_ECOSYSTEM()} dapps={dapps} />
                    </Animated.ScrollView>
                </BaseView>
            }
        />
    )
}

export const baseStyles = () =>
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
