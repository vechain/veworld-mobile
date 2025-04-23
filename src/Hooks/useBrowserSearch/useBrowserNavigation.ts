import { useNavigation } from "@react-navigation/native"
import { useCallback } from "react"
import { Routes } from "~Navigation"
import URIUtils from "~Utils/URIUtils"
import { useVisitedUrls } from "./useVisitedUrls"

export enum SearchError {
    ADDRESS_CANNOT_BE_REACHED,
}

export const useBrowserNavigation = () => {
    const nav = useNavigation()
    const { addVisitedUrl } = useVisitedUrls()

    const navigateToBrowser = useCallback(
        async (value: string) => {
            const valueLower = value.toLowerCase()
            const isValid = await URIUtils.isValidBrowserUrl(valueLower)
            if (isValid) {
                const url = URIUtils.parseUrl(valueLower)
                nav.navigate(Routes.BROWSER, { url })
                addVisitedUrl(url)
                return
            }

            return SearchError.ADDRESS_CANNOT_BE_REACHED
        },
        [nav, addVisitedUrl],
    )

    return { navigateToBrowser }
}
