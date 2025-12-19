import { useMemo } from "react"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectFeaturedDapps } from "~Storage/Redux"
import URIUtils from "~Utils/URIUtils"

/**
 * Get the dapp metadata from the url
 * @param url - The url to get the dapp metadata from
 * @param strict - If strict is true, the url will be compared strictly, otherwise it will be compared by the second level domain
 * @returns The dapp metadata
 */
export const useGetDappMetadataFromUrl = (url: string, strict: boolean = true) => {
    const allDapps = useAppSelector(selectFeaturedDapps)

    const dappMetadata = useMemo(() => {
        const foundDapp = allDapps.find(app =>
            strict
                ? new URL(app.href).origin === new URL(url).origin
                : URIUtils.compareSecondLevelDomains(app.href, url),
        )
        return foundDapp
    }, [allDapps, url, strict])

    return dappMetadata
}
