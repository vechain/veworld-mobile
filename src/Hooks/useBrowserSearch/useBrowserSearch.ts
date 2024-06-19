import { useNavigation } from "@react-navigation/native"
import { URIUtils } from "~Utils"
import { Routes } from "~Navigation"
import { useVisitedUrls } from "./useVisitedUrls"
import { useCallback } from "react"

export const useBrowserSearch = () => {
    const nav = useNavigation()
    const { addVisitedUrl } = useVisitedUrls()

    const navigateToBrowser = useCallback(
        async (searchStr: string) => {
            const isValid = await URIUtils.isValidBrowserUrl(searchStr.toLowerCase())

            if (isValid) {
                let navInput = searchStr

                if (!searchStr.toLowerCase().startsWith("http")) {
                    navInput = `https://${searchStr}`
                }

                addVisitedUrl(navInput)
                nav.navigate(Routes.BROWSER, { url: navInput })
            } else {
                const url = `https://www.google.com/search?q=${encodeURIComponent(searchStr)}&oq=${encodeURIComponent(
                    searchStr,
                )}`

                addVisitedUrl(url)
                nav.navigate(Routes.BROWSER, {
                    url,
                })
            }
        },
        [nav, addVisitedUrl],
    )

    return { navigateToBrowser }
}
