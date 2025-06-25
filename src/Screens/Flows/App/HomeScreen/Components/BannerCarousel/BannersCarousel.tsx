import React, { useCallback, useMemo } from "react"
import { BaseCarousel, BaseSpacer, CarouselSlideItem } from "~Components"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { AnalyticsEvent, STARGATE_DAPP_URL } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { StargateBannerClosable } from "~Components/Reusable"
import {
    useAppSelector,
    selectHideStargateBannerHomeScreen,
    setHideStargateBannerHomeScreen,
    useAppDispatch,
} from "~Storage/Redux"

type Props = {
    /**
     * Used to determine the location of the banner carousel to handle visibility of the Stargate banner.
     */
    location: "home_screen" | "token_screen"
}

export const BannersCarousel = ({ location }: Props) => {
    const featureFlags = useFeatureFlags()
    const track = useAnalyticTracking()
    const hideStargateBannerHomeScreen = useAppSelector(selectHideStargateBannerHomeScreen)

    const dispatch = useAppDispatch()

    const banners: CarouselSlideItem[] = useMemo(
        () => [
            {
                testID: "Stargate_banner",
                name: "Stargate",
                href: STARGATE_DAPP_URL,
                content: <StargateBannerClosable />,
                closable: location === "home_screen",
                closeButtonStyle: {
                    right: 18,
                    top: 2,
                },
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
            {location === "home_screen" && <BaseSpacer height={location === "home_screen" ? 16 : 40} />}
            <BaseCarousel
                h={88}
                data={filteredBanners}
                showPagination={false}
                autoPlay={false}
                loop={false}
                testID={`${location}_carousel`}
                onSlidePressActivation="before"
                onSlidePress={onSlidePress}
            />
            <BaseSpacer height={location === "home_screen" ? 32 : 40} />
        </>
    )
}
