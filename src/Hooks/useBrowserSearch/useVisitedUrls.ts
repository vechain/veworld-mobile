import { useCallback } from "react"
import { useInAppBrowser } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { deleteVisitedUrl, setVisitedUrl, useAppDispatch } from "~Storage/Redux"
import { URIUtils } from "~Utils"

export const useVisitedUrls = () => {
    const dispatch = useAppDispatch()
    const { navigationState } = useInAppBrowser()

    const addVisitedUrl = useCallback(
        (url: string) => {
            const _url = new URL(url)
            const href = _url.search.length === 0 ? URIUtils.clean(_url.href) : url

            const visitedUrl: DiscoveryDApp = {
                name: navigationState?.title ?? _url.host,
                href: href,
                desc: "",
                isCustom: true,
                createAt: new Date().getTime(),
                amountOfNavigations: 1,
            }

            dispatch(setVisitedUrl(visitedUrl))
        },
        [dispatch, navigationState?.title],
    )

    const removeVisitedUrl = useCallback(
        (dapp: DiscoveryDApp) => {
            dispatch(deleteVisitedUrl(dapp.href))
        },
        [dispatch],
    )

    return { addVisitedUrl, removeVisitedUrl }
}
