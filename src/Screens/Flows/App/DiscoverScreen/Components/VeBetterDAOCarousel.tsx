import React, { useMemo } from "react"
import {
    VeBetterDaoLightBanner,
    VeBetterDaoDarkBanner,
    VeBetterDaoStellaBanner,
    VeBetterDaoVoteBanner,
    VeBetterDaoMakeDappBanner,
} from "~Assets/Banners"
import { BaseCarousel, CarouselSlideItem, useFeatureFlags } from "~Components"
import { useCurrentAllocationsRoundId, useTheme } from "~Hooks"

const DAO_URL = "https://governance.vebetterdao.org/"
const DAO_VOTE_URL = "https://governance.vebetterdao.org/rounds/"
const DAO_MAKE_APP_URL = "https://docs.vebetterdao.org/developer-guides/get-started"
const STELLA_URL = "https://www.stellapay.io/b/WGWV"

export const VeBetterDAOCarousel = () => {
    const theme = useTheme()
    const { data } = useCurrentAllocationsRoundId()
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
                testID: "VeBetterDao_vote_banner",
                source: VeBetterDaoVoteBanner,
                href: `${DAO_VOTE_URL}${data ?? ""}`,
            },
            {
                testID: "VeBetterDao_make_app_banner",
                source: VeBetterDaoMakeDappBanner,
                href: DAO_MAKE_APP_URL,
            },
        ],
        [data, theme.isDark],
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
            w={360}
            h={100}
            paginationAlignment="flex-start"
            autoPlay={featureFlags.discoveryFeature.bannersAutoplay}
        />
    )
}
