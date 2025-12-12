import React, { useCallback, useMemo } from "react"
import { BaseSpacer, CarouselSlideItem, FullscreenBaseCarousel } from "~Components"
import { CarouselPressEvent } from "~Components/Base/BaseCarousel/BaseCarouselItem"
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
        (event: CarouselPressEvent) => {
            if (event.name === "Stargate") {
                track(AnalyticsEvent.DISCOVERY_STARGATE_BANNER_CLICKED, { location })
            }
        },
        [track, location],
    )

    if (filteredBanners.length === 0) return null

    return (
        <>
            {location === "home_screen" && <BaseSpacer height={location === "home_screen" ? 16 : 40} />}
            <FullscreenBaseCarousel
                itemHeight={88}
                data={filteredBanners}
                showPagination={false}
                testID={`${location}_carousel`}
                onSlidePressActivation="before"
                onSlidePress={onSlidePress}
                gap={0}
                // Remove the -16 if you need to have another item
                baseWidth={SCREEN_WIDTH - 16}
                padding={16}
                {...(location === "token_screen" && {
                    padding: 0,
                    baseWidth: SCREEN_WIDTH - 32,
                })}
            />
            <BaseSpacer height={location === "home_screen" ? 16 : 40} />
        </>
    )
}
