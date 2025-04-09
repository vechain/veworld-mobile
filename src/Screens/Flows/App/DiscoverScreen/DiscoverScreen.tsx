import { useNavigation, useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useEffect, useRef } from "react"
import { StyleSheet } from "react-native"
import Animated, { useAnimatedRef } from "react-native-reanimated"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useFetchFeaturedDApps, useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import {
    selectBookmarkedDapps,
    selectFeaturedDapps,
    selectHasUserOpenedDiscovery,
    setDiscoverySectionOpened,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { Ecosystem, Favourites, Header, NewDapps } from "./Components"
import { PopularTrendingDApps } from "./Components/PopularTrendingDApps"
import { VeBetterDAOCarousel } from "./Components/VeBetterDAOCarousel"

import { useDAppActions } from "./Hooks"

export const DiscoverScreen: React.FC = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const dispatch = useAppDispatch()
    const { styles } = useThemedStyles(baseStyles)

    useFetchFeaturedDApps()

    const animatedRef = useAnimatedRef<Animated.ScrollView>()

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const hasOpenedDiscovery = useAppSelector(selectHasUserOpenedDiscovery)
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const dapps = useAppSelector(selectFeaturedDapps)
    const { onDAppPress } = useDAppActions()

    const showFavorites = bookmarkedDApps.length > 0

    useEffect(() => {
        if (!hasOpenedDiscovery) {
            track(AnalyticsEvent.DISCOVERY_SECTION_OPENED)
            dispatch(setDiscoverySectionOpened())
        }
    }, [track, hasOpenedDiscovery, dispatch])

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
                                    bookmarkedDApps={bookmarkedDApps}
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
