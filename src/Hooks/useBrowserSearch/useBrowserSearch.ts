import { useNavigation } from "@react-navigation/native"
import { URIUtils } from "~Utils"
import { Routes } from "~Navigation"

export const useBrowserSearch = () => {
    const nav = useNavigation()

    const navigateToBrowser = async (searchStr: string) => {
        const isValid =
            (await URIUtils.isValidBrowserUrl(searchStr.toLowerCase())) ||
            (await URIUtils.isValidBrowserUrl(`https://${searchStr.toLowerCase()}`))

        if (isValid) {
            let navInput = searchStr

            if (!searchStr.toLowerCase().startsWith("http")) {
                navInput = `https://${searchStr}`
            }

            nav.navigate(Routes.BROWSER, { initialUrl: navInput })
        } else {
            nav.navigate(Routes.BROWSER, {
                initialUrl: `https://www.google.com/search?q=${encodeURIComponent(searchStr)}&oq=${encodeURIComponent(
                    searchStr,
                )}`,
            })
        }
    }

    return { navigateToBrowser }
}
