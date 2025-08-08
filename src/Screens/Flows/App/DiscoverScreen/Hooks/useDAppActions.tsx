import { useCallback } from "react"
import { useNotifications } from "~Components"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useCameraPermissions, useVisitedUrls } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { VbdDApp } from "~Model"
import { addNavigationToDApp, useAppDispatch } from "~Storage/Redux"

export const useDAppActions = () => {
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const { addVisitedUrl } = useVisitedUrls()
    const { increaseDappCounter } = useNotifications()
    const { checkPermissions } = useCameraPermissions({
        onCanceled: () => {},
    })
    const { navigateWithTab } = useBrowserTab()

    const onDAppPress = useCallback(
        async (dapp: DiscoveryDApp | VbdDApp) => {
            const discoveryDapp = dapp as DiscoveryDApp
            const vbdDapp = dapp as VbdDApp
            const url = discoveryDapp.href || vbdDapp.external_url
            const id = discoveryDapp.veBetterDaoId || vbdDapp.id
            const title = discoveryDapp.name || vbdDapp.name
            const isCustom = (discoveryDapp.isCustom || false) ?? false

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, { url })

            if (id) {
                increaseDappCounter(id)
                await checkPermissions()
            }

            addVisitedUrl(url)

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: url, isCustom }))
            }, 1000)

            navigateWithTab({ url, title })
        },
        [track, addVisitedUrl, navigateWithTab, increaseDappCounter, checkPermissions, dispatch],
    )

    return { onDAppPress }
}
