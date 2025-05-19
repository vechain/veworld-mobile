import React, { useCallback, useMemo } from "react"
import { BaseCarousel, CarouselSlideItem, useFeatureFlags } from "~Components"
import { VeBetterDaoBanner, StellaPayBanner } from "./Banners"
import { AnalyticsEvent } from "~Constants/Enums/AnalyticsEvent"
import { useAnalyticTracking } from "~Hooks"

const DAO_URL = "https://governance.vebetterdao.org"
const STELLA_URL = "https://vebetter.stellapay.io/"
const slides: CarouselSlideItem[] = [
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
]

export const VeBetterDAOCarousel = () => {
    const featureFlags = useFeatureFlags()
    const track = useAnalyticTracking()

    const activeSlides = useMemo(() => {
        return slides.filter(slide => {
            if (slide.name === "stella") {
                return featureFlags.discoveryFeature.showStellaPayBanner
            }
            return true
        })
    }, [featureFlags.discoveryFeature.showStellaPayBanner])

    const onSlidePress = useCallback(
        (name: string) => {
            if (name === "stella") {
                track(AnalyticsEvent.DISCOVERY_STELLAPAY_BANNER_CLICKED)
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
