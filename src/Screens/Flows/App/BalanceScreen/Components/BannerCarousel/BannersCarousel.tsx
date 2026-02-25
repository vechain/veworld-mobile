import React, { useCallback, useMemo } from "react"
import { CarouselSlideItem, FullscreenBaseCarousel } from "~Components"
import { CarouselPressEvent } from "~Components/Base/BaseCarousel/BaseCarouselItem"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { StargateBannerClosable, StargateXVeBetterBannerClosable } from "~Components/Reusable"
import { AnalyticsEvent, SCREEN_WIDTH, STARGATE_DAPP_URL_HOME_BANNER } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import {
    selectHideStargateBannerHomeScreen,
    selectHideStargateXVeBetterBanner,
    setHideStargateBannerHomeScreen,
    setHideStargateXVeBetterBanner,
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
    /**
     * Margin top.
     */
    mt?: number
}

export const BannersCarousel = ({ location, baseWidth = SCREEN_WIDTH - 32, padding = 24, mt }: Props) => {
    const featureFlags = useFeatureFlags()
    const track = useAnalyticTracking()
    const hideStargateBannerHomeScreen = useAppSelector(selectHideStargateBannerHomeScreen)
    const hideStargateXVeBetterBanner = useAppSelector(selectHideStargateXVeBetterBanner)

    const dispatch = useAppDispatch()

    const banners: CarouselSlideItem[] = useMemo(
        () => [
            {
                testID: "StargateXVbd_banner",
                name: "StargateXVeBetter",
                href: "https://governance.vebetterdao.org/nodes",
                content: <StargateXVeBetterBannerClosable />,
                closable: true,
                onClose: () => {
                    dispatch(setHideStargateXVeBetterBanner(true))
                    track(AnalyticsEvent.DISCOVERY_STARGATE_X_VEBETTER_BANNER_CLOSED)
                },
            },
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
                closeButtonStyle: {
                    // If the stargate banner is hidden, move the close button to the right
                    // to avoid the close button from being hidden by the banner
                    right: hideStargateBannerHomeScreen ? 0 : 30,
                },
            },
        ],
        [location, dispatch, track, hideStargateBannerHomeScreen],
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
                if (banner.name === "StargateXVeBetter") {
                    return !hideStargateXVeBetterBanner
                }
                return true
            }),
        [
            banners,
            featureFlags.discoveryFeature.showStargateBanner,
            hideStargateBannerHomeScreen,
            location,
            hideStargateXVeBetterBanner,
        ],
    )

    const onSlidePress = useCallback(
        (event: CarouselPressEvent) => {
            if (event.name === "Stargate") {
                track(AnalyticsEvent.DISCOVERY_STARGATE_BANNER_CLICKED, { location })
            }
        },
        [track, location],
    )

    const calculatedBaseWidth = useMemo(() => {
        if (filteredBanners.length === 1) {
            return baseWidth - 24
        }
        return baseWidth
    }, [filteredBanners.length, baseWidth])

    if (filteredBanners.length === 0) return null

    return (
        <FullscreenBaseCarousel
            itemHeight={88}
            data={filteredBanners}
            showPagination={false}
            testID={`${location}_carousel`}
            onSlidePressActivation="before"
            onSlidePress={onSlidePress}
            gap={8}
            // Remove the -16 if you need to have another item
            baseWidth={calculatedBaseWidth}
            padding={padding}
            rootStyle={{ marginTop: mt }}
        />
    )
}
