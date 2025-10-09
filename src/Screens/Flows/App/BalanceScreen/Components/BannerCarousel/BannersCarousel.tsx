import React, { useCallback, useMemo } from "react"
import { CarouselSlideItem, FullscreenBaseCarousel } from "~Components"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { StargateBannerClosable } from "~Components/Reusable"
import { AnalyticsEvent, SCREEN_WIDTH, STARGATE_DAPP_URL_HOME_BANNER } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import {
    selectHideStargateBannerHomeScreen,
    setHideStargateBannerHomeScreen,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type Props = {
    /**
     * Used to determine the location of the banner carousel to handle visibility of the Stargate banner.
     */
    location: "home_screen" | "token_screen"
    baseWidth?: number
    padding?: number
}

export const BannersCarousel = ({ location, baseWidth = SCREEN_WIDTH - 32, padding = 24 }: Props) => {
    const featureFlags = useFeatureFlags()
    const track = useAnalyticTracking()
    const hideStargateBannerHomeScreen = useAppSelector(selectHideStargateBannerHomeScreen)

    const dispatch = useAppDispatch()

    const banners: CarouselSlideItem[] = useMemo(
        () => [
            {
                testID: "Stargate_banner",
                name: "Stargate",
                href: STARGATE_DAPP_URL_HOME_BANNER,
                content: <StargateBannerClosable />,
                closable: location === "home_screen",
                onClose: () => {
                    if (location === "home_screen") {
                        dispatch(setHideStargateBannerHomeScreen(true))
                    }
                    track(AnalyticsEvent.DISCOVERY_STARGATE_BANNER_CLOSED, { location })
                },
            },
        ],
        [location, dispatch, track],
    )

    const filteredBanners = useMemo(
        () =>
            banners.filter(banner => {
                if (banner.name === "Stargate") {
                    return (
                        featureFlags.discoveryFeature.showStargateBanner &&
                        (location === "home_screen" ? !hideStargateBannerHomeScreen : true)
                    )
                }
                return true
            }),
        [banners, featureFlags.discoveryFeature.showStargateBanner, hideStargateBannerHomeScreen, location],
    )

    const onSlidePress = useCallback(
        (name: string) => {
            if (name === "Stargate") {
                track(AnalyticsEvent.DISCOVERY_STARGATE_BANNER_CLICKED, { location })
            }
        },
        [track, location],
    )

    if (filteredBanners.length === 0) return null

    return (
        <>
            <FullscreenBaseCarousel
                itemHeight={88}
                data={filteredBanners}
                showPagination={false}
                testID={`${location}_carousel`}
                onSlidePressActivation="before"
                onSlidePress={onSlidePress}
                gap={0}
                // Remove the -16 if you need to have another item
                baseWidth={baseWidth}
                padding={padding}
            />
        </>
    )
}
