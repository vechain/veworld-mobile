import React, { useCallback, useMemo } from "react"
import { BaseCarousel, BaseSpacer, CarouselSlideItem } from "~Components"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { StargateBannerClosable } from "~Components/Reusable"
import { useAppSelector, selectHideStargateBannerHomeScreen, selectHideStargateBannerVETScreen } from "~Storage/Redux"

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
    const hideStargateBannerVETScreen = useAppSelector(selectHideStargateBannerVETScreen)

    const banners: CarouselSlideItem[] = useMemo(
        () => [
            {
                testID: "Stargate_banner",
                name: "Stargate",
                href: "https://stargate.vechain.org",
                content: <StargateBannerClosable location={location} />,
            },
        ],
        [location],
    )

    const filteredBanners = useMemo(
        () =>
            banners.filter(banner => {
                if (banner.name === "Stargate") {
                    return (
                        featureFlags.discoveryFeature.showStargateBanner &&
                        (location === "home_screen" ? !hideStargateBannerHomeScreen : !hideStargateBannerVETScreen)
                    )
                }
                return true
            }),
        [
            banners,
            featureFlags.discoveryFeature.showStargateBanner,
            hideStargateBannerHomeScreen,
            hideStargateBannerVETScreen,
            location,
        ],
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
            <BaseSpacer height={location === "home_screen" ? 16 : 40} />
        </>
    )
}
