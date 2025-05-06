import { useCallback } from "react"
import { DiscoveryDApp, AnalyticsEvent } from "~Constants"
import { addNavigationToDApp, useAppDispatch } from "~Storage/Redux"
import { useAnalyticTracking, useCameraPermissions, useVisitedUrls } from "~Hooks"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { useNotifications } from "~Components"

export const useDAppActions = () => {
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const nav = useNavigation()
    const { addVisitedUrl } = useVisitedUrls()
    const { increaseDappCounter } = useNotifications()
    const { checkPermissions } = useCameraPermissions({
        onCanceled: () => {},
    })

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

            nav.navigate(Routes.BROWSER, { url: dapp.href })
        },
        [addVisitedUrl, checkPermissions, dispatch, increaseDappCounter, nav, track],
    )

    return { onDAppPress }
}
