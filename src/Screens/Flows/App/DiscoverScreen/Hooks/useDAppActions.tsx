import { useCallback, useMemo } from "react"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useCameraPermissions, useVisitedUrls } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { VbdDApp, NETWORK_TYPE } from "~Model"
import {
    addNavigationToDApp,
    increaseDappVisitCounter,
    selectNotificationFeautureEnabled,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useDAppActions = () => {
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const { addVisitedUrl } = useVisitedUrls()
    const { checkPermissions } = useCameraPermissions({
        onCanceled: () => {},
    })
    const { navigateWithTab } = useBrowserTab()

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
