import React, { useCallback, useMemo } from "react"
import { CarouselSlideItem, FullscreenBaseCarousel, useFeatureFlags } from "~Components"
import { STARGATE_DAPP_URL_DISCOVER_BANNER, STARGATE_DAPP_URL_HOME_BANNER } from "~Constants"
import { AnalyticsEvent } from "~Constants/Enums/AnalyticsEvent"
import { useAnalyticTracking } from "~Hooks"
import { StargateBanner, StellaPayBanner, VeBetterDaoBanner } from "./Banners"
import { useRoute } from "@react-navigation/native"
import { Routes } from "~Navigation"

const DAO_URL = "https://governance.vebetterdao.org"
const STELLA_URL = "https://vebetter.stellapay.io/"

export const VeBetterDAOCarousel = () => {
    const featureFlags = useFeatureFlags()
    const track = useAnalyticTracking()
    const location = useRoute()

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
                href:
                    location.name === Routes.HOME || location.name === Routes.TOKEN_DETAILS
                        ? STARGATE_DAPP_URL_HOME_BANNER
                        : STARGATE_DAPP_URL_DISCOVER_BANNER,
                name: "stargate",
            },
        ],
        [location.name],
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
        <FullscreenBaseCarousel
            testID="VeBetterDao_carousel"
            data={activeSlides}
            paginationAlignment="flex-start"
            showPagination={false}
            onSlidePressActivation="before"
            onSlidePress={onSlidePress}
            padding={16}
        />
    )
}
