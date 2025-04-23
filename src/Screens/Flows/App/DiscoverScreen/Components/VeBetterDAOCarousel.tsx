import React, { useCallback, useMemo } from "react"
import {
    VeBetterDaoDarkBanner,
    VeBetterDaoLightBanner,
    VeBetterDaoMakeDappBanner,
    VeBetterDaoStellaBanner,
    VeBetterDaoVoteBanner,
} from "~Assets/Banners"
import { BaseCarousel, CarouselSlideItem, useFeatureFlags } from "~Components"
import { useCurrentAllocationsRoundId, useTheme } from "~Hooks"
import { incrementBannerInteractions, selectBannerInteractions, useAppDispatch, useAppSelector } from "~Storage/Redux"

const DAO_URL = "https://governance.vebetterdao.org/apps"
const DAO_VOTE_URL = "https://governance.vebetterdao.org/rounds/"
const DAO_MAKE_APP_URL = "https://docs.vebetterdao.org"
const STELLA_URL = "https://www.stellapay.io/b/WGWV"

const defaultSorting = ["vbd_vote", "vbd_main", "stella", "vbd_make_dapp"]

const applyDefaultSorting = (a: CarouselSlideItem, b: CarouselSlideItem) =>
    defaultSorting.indexOf(a.name || "") - defaultSorting.indexOf(b.name || "")

export const VeBetterDAOCarousel = () => {
    const theme = useTheme()
    const { data } = useCurrentAllocationsRoundId()
    const featureFlags = useFeatureFlags()
    const dispatch = useAppDispatch()
    const bannerInteractions = useAppSelector(selectBannerInteractions)

    const slides: CarouselSlideItem[] = useMemo(
        () => [
            {
                testID: "VeBetterDao_stella_banner",
                source: VeBetterDaoStellaBanner,
                href: STELLA_URL,
                isExternalLink: true,
                name: "stella",
            },
            {
                testID: "VeBetterDao_banner",
                source: theme.isDark ? VeBetterDaoDarkBanner : VeBetterDaoLightBanner,
                href: DAO_URL,
                name: "vbd_main",
            },
            {
                testID: "VeBetterDao_vote_banner",
                source: VeBetterDaoVoteBanner,
                href: `${DAO_VOTE_URL}${data ?? ""}`,
                name: "vbd_vote",
            },
            {
                testID: "VeBetterDao_make_app_banner",
                source: VeBetterDaoMakeDappBanner,
                href: DAO_MAKE_APP_URL,
                name: "vbd_make_dapp",
            },
        ],
        [data, theme.isDark],
    )

    const activeSlides = useMemo(() => {
        return slides.filter(slide => {
            if (slide.name === "stella") {
                return featureFlags.discoveryFeature.showStellaPayBanner
            }
            return true
        })
    }, [featureFlags.discoveryFeature.showStellaPayBanner, slides])

    const sortedSlides = useMemo(() => {
        return activeSlides.sort(applyDefaultSorting).sort((a, b) => {
            return (
                (bannerInteractions[b.name ?? ""]?.amountOfInteractions ?? 0) -
                (bannerInteractions[a.name ?? ""]?.amountOfInteractions ?? 0)
            )
        })
    }, [activeSlides, bannerInteractions])

    const onSlidePress = useCallback(
        (name: string) => {
            setTimeout(() => dispatch(incrementBannerInteractions(name)), 1000)
        },
        [dispatch],
    )

    return (
        <BaseCarousel
            testID="VeBetterDao_carousel"
            data={sortedSlides}
            w={360}
            h={100}
            paginationAlignment="flex-start"
            autoPlay={featureFlags.discoveryFeature.bannersAutoplay}
            onSlidePress={onSlidePress}
        />
    )
}
