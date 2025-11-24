import { useRoute } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { CarouselSlideItem, FullscreenBaseCarousel, StellaPayBottomSheet, useFeatureFlags } from "~Components"
import { SCREEN_WIDTH, STARGATE_DAPP_URL_DISCOVER_BANNER, STARGATE_DAPP_URL_HOME_BANNER } from "~Constants"
import { AnalyticsEvent } from "~Constants/Enums/AnalyticsEvent"
import { useAnalyticTracking, useBottomSheetModal } from "~Hooks"
import { Routes } from "~Navigation"
import { StargateBanner, StellaPayBanner, VeBetterDaoBanner } from "./Banners"
import { CarouselPressEvent } from "~Components/Base/BaseCarousel/BaseCarouselItem"
import { selectHideStellaPayBottomSheet, useAppSelector } from "~Storage/Redux"

const DAO_URL = "https://governance.vebetterdao.org"
const STELLA_URL = "https://vebetter.stellapay.io/"

export const VeBetterDAOCarousel = () => {
    const featureFlags = useFeatureFlags()
    const track = useAnalyticTracking()
    const location = useRoute()
    const { ref: stellaPayBottomSheetRef, onOpen: onOpenStellaPayBottomSheet } = useBottomSheetModal()
    const hideStellaPayBottomSheet = useAppSelector(selectHideStellaPayBottomSheet)

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
        (event: CarouselPressEvent) => {
            if (event.name === "stella") {
                track(AnalyticsEvent.DISCOVERY_STELLAPAY_BANNER_CLICKED)
                if (!hideStellaPayBottomSheet) {
                    event.preventDefault()
                    onOpenStellaPayBottomSheet()
                }
            } else if (event.name === "stargate") {
                track(AnalyticsEvent.DISCOVERY_STARGATE_BANNER_CLICKED, { location: "discover_screen" })
            } else {
                track(AnalyticsEvent.DISCOVERY_VEBETTERDAO_BANNER_CLICKED)
            }
        },
        [track, onOpenStellaPayBottomSheet, hideStellaPayBottomSheet],
    )

    return (
        <>
            <FullscreenBaseCarousel
                testID="VeBetterDao_carousel"
                data={activeSlides}
                showPagination={false}
                onSlidePressActivation="before"
                onSlidePress={onSlidePress}
                padding={16}
                itemHeight={108}
                gap={8}
                baseWidth={SCREEN_WIDTH}
            />
            <StellaPayBottomSheet ref={stellaPayBottomSheetRef} />
        </>
    )
}
