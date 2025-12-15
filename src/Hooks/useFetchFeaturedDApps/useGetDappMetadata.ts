import { useMemo } from "react"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectFeaturedDapps } from "~Storage/Redux"
import URIUtils from "~Utils/URIUtils"

export const useGetDappMetadataFromUrl = (url: string) => {
    const allDapps = useAppSelector(selectFeaturedDapps)

    const dappMetadata = useMemo(() => {
        const foundDapp = allDapps.find(app => URIUtils.compareSecondLevelDomains(app.href, url))
        return foundDapp
    }, [allDapps, url])

    return dappMetadata
}
