import { useMemo } from "react"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectFeaturedDapps } from "~Storage/Redux"

export const useGetDappMetadataFromUrl = (url: string) => {
    const allDapps = useAppSelector(selectFeaturedDapps)

    const dappMetadata = useMemo(() => {
        const foundDapp = allDapps.find(app => new URL(app.href).origin === new URL(url).origin)
        return foundDapp
    }, [allDapps, url])

    return dappMetadata
}
