import React from "react"
import { VeBetterDaoLightBanner, VeBetterDaoDarkBanner, VeBetterDaoStellaBanner } from "~Assets/Banners"
import { BaseCarousel, CarouselSlideItem } from "~Components"
import { useTheme } from "~Hooks"

const DAO_URL = "https://governance.vebetterdao.org/"
const STELLA_URL = ""

export const VeBetterDAOCarousel = () => {
    const theme = useTheme()
    const slides: CarouselSlideItem[] = [
        {
            testID: "VeBetterDao_banner",
            source: theme.isDark ? VeBetterDaoDarkBanner : VeBetterDaoLightBanner,
            href: DAO_URL,
        },
        { testID: "VeBetterDao_stella_banner", source: VeBetterDaoStellaBanner, href: STELLA_URL },
    ]

    return <BaseCarousel data={slides} />
}
