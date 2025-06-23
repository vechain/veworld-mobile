import React, { useCallback, useMemo } from "react"
import { BaseCarousel, CarouselSlideItem, useFeatureFlags } from "~Components"
import { VeBetterDaoBanner, StellaPayBanner, StargateBanner } from "./Banners"
import { AnalyticsEvent } from "~Constants/Enums/AnalyticsEvent"
import { useAnalyticTracking } from "~Hooks"

const DAO_URL = "https://governance.vebetterdao.org"
const STELLA_URL = "https://vebetter.stellapay.io/"
const STARGATE_URL = "https://stargate.vechain.org/"

export const VeBetterDAOCarousel = () => {
    const featureFlags = useFeatureFlags()
    const track = useAnalyticTracking()

    const slides: CarouselSlideItem[] = useMemo(
        () => [
            {
                testID: "VeBetterDao_banner",
                content: <VeBetterDaoBanner />,
                href: DAO_URL,
                name: "vbd_main",
            },
            {
                testID: "VeBetterDao_stella_banner",
                content: <StellaPayBanner />,
                href: STELLA_URL,
                isExternalLink: true,
                name: "stella",
            },
            {
                testID: "Stargate_banner",
                content: <StargateBanner />,
                href: STARGATE_URL,
                name: "stargate",
            },
        ],
        [],
    )

    const activeSlides = useMemo(() => {
        return slides.filter(slide => {
            if (slide.name === "stella") {
                return featureFlags.discoveryFeature.showStellaPayBanner
            }
            if (slide.name === "stargate") {
                return featureFlags.discoveryFeature.showStargateBanner
            }
            return true
        })
    }, [featureFlags.discoveryFeature.showStellaPayBanner, featureFlags.discoveryFeature.showStargateBanner, slides])

    const onSlidePress = useCallback(
        (name: string) => {
            if (name === "stella") {
                track(AnalyticsEvent.DISCOVERY_STELLAPAY_BANNER_CLICKED)
            } else if (name === "stargate") {
                track(AnalyticsEvent.DISCOVERY_STARGATE_BANNER_CLICKED, { location: "discover_screen" })
            } else {
                track(AnalyticsEvent.DISCOVERY_VEBETTERDAO_BANNER_CLICKED)
            }
        },
        [track],
    )

    return (
        <BaseCarousel
            testID="VeBetterDao_carousel"
            data={activeSlides}
            paginationAlignment="flex-start"
            loop={false}
            autoPlay={featureFlags.discoveryFeature.bannersAutoplay}
            showPagination={false}
            onSlidePressActivation="before"
            onSlidePress={onSlidePress}
        />
    )
}
