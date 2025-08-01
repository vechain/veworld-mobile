import { useNavigation, useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useEffect, useRef } from "react"
import { ScrollView, StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView, Layout, StargateStakingBanner, useFeatureFlags } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useFetchFeaturedDApps, useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import {
    selectBookmarkedDapps,
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
    const featureFlags = useFeatureFlags()

    useFetchFeaturedDApps()

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const hasOpenedDiscovery = useAppSelector(selectHasUserOpenedDiscovery)
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
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
                    <ScrollView
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

                        {featureFlags.discoveryFeature.showStargateBanner && (
                            <BaseView px={16}>
                                <BaseText typographyFont="subSubTitleSemiBold">{LL.DISCOVER_TAB_STAKING()}</BaseText>
                                <BaseSpacer height={16} />
                                <StargateStakingBanner />
                                <BaseSpacer height={48} />
                            </BaseView>
                        )}

                        {/* New Dapps */}
                        <NewDapps />
                        <BaseSpacer height={48} />

                        {/* Trending & Popular */}
                        <PopularTrendingDApps />
                        <BaseSpacer height={48} />

                        <Ecosystem title={LL.DISCOVER_ECOSYSTEM()} />
                    </ScrollView>
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
