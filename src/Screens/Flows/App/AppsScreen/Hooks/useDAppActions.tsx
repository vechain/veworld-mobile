import { useCallback, useMemo } from "react"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useCameraPermissions, useVisitedUrls } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { NETWORK_TYPE, VbdDApp } from "~Model"
import { Routes } from "~Navigation"
import {
    addNavigationToDApp,
    increaseDappVisitCounter,
    selectNotificationFeautureEnabled,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useDAppActions = (sourceScreen?: Routes) => {
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)

    const { addVisitedUrl } = useVisitedUrls()
    const { checkPermissions } = useCameraPermissions({
        onCanceled: () => {},
    })
    const { navigateWithTab } = useBrowserTab(sourceScreen)
    const isMainnet = useMemo(() => network.type === NETWORK_TYPE.MAIN, [network.type])
    const notificationFeatureEnabled = useAppSelector(selectNotificationFeautureEnabled)

    /**
     * This function is a copy of what there is in the Notification Provider.
     * This is needed in order to correctly use some BottomSheets
     */
    const increaseDappCounter = useCallback(
        (dappId: string) => {
            if (dappId && isMainnet && notificationFeatureEnabled) {
                dispatch(increaseDappVisitCounter({ dappId: dappId }))
            }
        },
        [dispatch, isMainnet, notificationFeatureEnabled],
    )

    const onDAppPress = useCallback(
        async (dapp: DiscoveryDApp | VbdDApp) => {
            const href = "external_url" in dapp ? dapp.external_url : dapp.href
            const vbdId = "external_url" in dapp ? dapp.id : dapp.veBetterDaoId
            const isCustom = "external_url" in dapp ? false : dapp.isCustom ?? false

            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: href,
            })

            if (vbdId) {
                increaseDappCounter(vbdId)
                await checkPermissions()
            }

            addVisitedUrl(href)

            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: isCustom }))
            }, 1000)

            navigateWithTab({ url: href, title: dapp.name })
        },
        [track, addVisitedUrl, navigateWithTab, increaseDappCounter, checkPermissions, dispatch],
    )

    return { onDAppPress }
}
