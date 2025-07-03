import { useCallback } from "react"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import URIUtils from "~Utils/URIUtils"
import { useVisitedUrls } from "./useVisitedUrls"

export enum SearchError {
    ADDRESS_CANNOT_BE_REACHED,
}

export const useBrowserNavigation = () => {
    const { addVisitedUrl } = useVisitedUrls()
    const { navigateWithTab } = useBrowserTab()

    const navigateToBrowser = useCallback(
        async (value: string) => {
            const valueLower = value.toLowerCase()
            const isValid = await URIUtils.isValidBrowserUrl(valueLower)
            if (isValid) {
                const url = URIUtils.parseUrl(valueLower)
                navigateWithTab({ url, title: url })
                addVisitedUrl(url)
                return
            }

            return SearchError.ADDRESS_CANNOT_BE_REACHED
        },
        [navigateWithTab, addVisitedUrl],
    )

    return { navigateToBrowser }
}
