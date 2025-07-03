import { useCallback } from "react"
import { useNotifications } from "~Components"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useCameraPermissions, useVisitedUrls } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
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
        async (dapp: DiscoveryDApp) => {
            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: dapp.href,
            })

            if (dapp.veBetterDaoId) {
                increaseDappCounter(dapp.veBetterDaoId)
                await checkPermissions()
            }

            addVisitedUrl(dapp.href)

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: dapp.href, isCustom: dapp.isCustom ?? false }))
            }, 1000)

            navigateWithTab({ url: dapp.href, title: dapp.name })
        },
        [track, addVisitedUrl, navigateWithTab, increaseDappCounter, checkPermissions, dispatch],
    )

    return { onDAppPress }
}
