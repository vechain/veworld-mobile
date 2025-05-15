import React, { useMemo } from "react"
import { BaseCarousel, CarouselSlideItem, useFeatureFlags } from "~Components"
import { VeBetterDaoBanner, StellaPayBanner } from "./Banners"

const DAO_URL = "https://governance.vebetterdao.org"
const STELLA_URL = "https://www.stellapay.io/b/WGWV"

export const VeBetterDAOCarousel = () => {
    const featureFlags = useFeatureFlags()

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
        ],
        [],
    )

    const activeSlides = useMemo(() => {
        return slides.filter(slide => {
            if (slide.name === "stella") {
                return featureFlags.discoveryFeature.showStellaPayBanner
            }
            return true
        })
    }, [featureFlags.discoveryFeature.showStellaPayBanner, slides])

    return (
        <BaseCarousel
            testID="VeBetterDao_carousel"
            data={activeSlides}
            paginationAlignment="flex-start"
            loop={false}
            autoPlay={featureFlags.discoveryFeature.bannersAutoplay}
            showPagination={false}
        />
    )
}
