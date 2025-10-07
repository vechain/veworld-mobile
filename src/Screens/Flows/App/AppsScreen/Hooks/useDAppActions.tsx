import { useCallback, useMemo } from "react"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useCameraPermissions, useVisitedUrls } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { NETWORK_TYPE } from "~Model"
import {
    addNavigationToDApp,
    increaseDappVisitCounter,
    selectNotificationFeautureEnabled,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const useDAppActions = (sourceScreen?: string) => {
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
                dispatch(addNavigationToDApp({ href: dapp.href, isCustom: dapp.isCustom ?? false, sourceScreen }))
            }, 1000)

            navigateWithTab({ url: dapp.href, title: dapp.name })
        },
        [track, addVisitedUrl, navigateWithTab, increaseDappCounter, checkPermissions, dispatch, sourceScreen],
    )

    return { onDAppPress }
}
