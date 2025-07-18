import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseCarousel, CarouselSlideItem, useFeatureFlags } from "~Components"
import { SCREEN_WIDTH, STARGATE_DAPP_URL } from "~Constants"
import { AnalyticsEvent } from "~Constants/Enums/AnalyticsEvent"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { StargateBanner, StellaPayBanner, VeBetterDaoBanner } from "./Banners"

const DAO_URL = "https://governance.vebetterdao.org"
const STELLA_URL = "https://vebetter.stellapay.io/"

export const VeBetterDAOCarousel = () => {
    const featureFlags = useFeatureFlags()
    const track = useAnalyticTracking()
    const { styles } = useThemedStyles(baseStyles)

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
                href: STARGATE_DAPP_URL,
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

    const snapOffsets = useMemo(() => activeSlides.map((_, idx) => SCREEN_WIDTH * idx), [activeSlides])

    return (
        <BaseCarousel
            testID="VeBetterDao_carousel"
            data={activeSlides}
            paginationAlignment="flex-start"
            showPagination={false}
            onSlidePressActivation="before"
            onSlidePress={onSlidePress}
            gap={0}
            w={SCREEN_WIDTH - 32}
            padding={0}
            contentWrapperStyle={styles.itemWrapper}
            snapOffsets={snapOffsets}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        itemWrapper: {
            paddingHorizontal: 16,
            width: SCREEN_WIDTH,
        },
    })
