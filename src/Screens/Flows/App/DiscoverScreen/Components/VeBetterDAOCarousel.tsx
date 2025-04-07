import React, { useMemo } from "react"
import {
    VeBetterDaoLightBanner,
    VeBetterDaoDarkBanner,
    VeBetterDaoStellaBanner,
    VeBetterDaoMakeDappBanner,
} from "~Assets/Banners"
import { BaseCarousel, CarouselSlideItem } from "~Components"
import { useTheme } from "~Hooks"
import { useFeatureFlags } from "~Components/Providers"

const DAO_URL = "https://governance.vebetterdao.org/"
const DAO_MAKE_APP_URL = "https://docs.vechain.org/"
const STELLA_URL = "https://www.stellapay.io/b/WGWV"

export const VeBetterDAOCarousel = () => {
    const theme = useTheme()
    const featureFlags = useFeatureFlags()

    const slides: CarouselSlideItem[] = useMemo(
        () => [
            { testID: "VeBetterDao_stella_banner", source: VeBetterDaoStellaBanner, href: STELLA_URL },
            {
                testID: "VeBetterDao_banner",
                source: theme.isDark ? VeBetterDaoDarkBanner : VeBetterDaoLightBanner,
                href: DAO_URL,
            },
            {
                testID: "VeBetterDao_make_app_banner",
                source: VeBetterDaoMakeDappBanner,
                href: DAO_MAKE_APP_URL,
                isExternalLink: true,
            },
        ],
        [theme.isDark],
    )

    const activeSlides = useMemo(() => {
        return slides.filter(slide => {
            if (slide.testID === "VeBetterDao_stella_banner") {
                return featureFlags.discoveryFeature.showStellaPayBanner
            }
            return true
        })
    }, [featureFlags.discoveryFeature.showStellaPayBanner, slides])

    return (
        <BaseCarousel
            data={activeSlides}
            paginationAlignment="flex-start"
            autoPlay={activeSlides.length > 2 ? true : false}
        />
    )
}
