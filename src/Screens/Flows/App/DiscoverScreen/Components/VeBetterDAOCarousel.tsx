import React from "react"
import {
    VeBetterDaoLightBanner,
    VeBetterDaoDarkBanner,
    VeBetterDaoStellaBanner,
    VeBetterDaoVoteDarkBanner,
    VeBetterDaoVoteLightBanner,
    VeBetterDaoMakeDappDarkBanner,
    VeBetterDaoMakeDappLightBanner,
} from "~Assets/Banners"
import { BaseCarousel, CarouselSlideItem } from "~Components"
import { useCurrentAllocationsRoundId, useTheme } from "~Hooks"

const DAO_URL = "https://governance.vebetterdao.org/"
const DAO_VOTE_URL = "https://governance.vebetterdao.org/rounds/"
const DAO_MAKE_APP_URL = "https://docs.vechain.org/"
const STELLA_URL = ""

export const VeBetterDAOCarousel = () => {
    const theme = useTheme()
    const { data } = useCurrentAllocationsRoundId()

    const slides: CarouselSlideItem[] = [
        {
            testID: "VeBetterDao_banner",
            source: theme.isDark ? VeBetterDaoDarkBanner : VeBetterDaoLightBanner,
            href: DAO_URL,
        },
        { testID: "VeBetterDao_stella_banner", source: VeBetterDaoStellaBanner, href: STELLA_URL },
        {
            testID: "VeBetterDao_vote_banner",
            source: theme.isDark ? VeBetterDaoVoteDarkBanner : VeBetterDaoVoteLightBanner,
            href: `${DAO_VOTE_URL}${data ?? ""}`,
        },
        {
            testID: "VeBetterDao_make_app_banner",
            source: theme.isDark ? VeBetterDaoMakeDappDarkBanner : VeBetterDaoMakeDappLightBanner,
            href: DAO_MAKE_APP_URL,
            isExternalLink: true,
        },
    ]

    return <BaseCarousel data={slides} />
}
