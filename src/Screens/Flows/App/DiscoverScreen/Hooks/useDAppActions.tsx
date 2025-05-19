import { useNavigation } from "@react-navigation/native"
import { uuidv4 } from "@walletconnect/utils"
import { useCallback } from "react"
import { useNotifications } from "~Components"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useCameraPermissions, useVisitedUrls } from "~Hooks"
import { Routes } from "~Navigation"
import { addNavigationToDApp, openTab, selectTabs, setCurrentTab, useAppDispatch, useAppSelector } from "~Storage/Redux"

export const useDAppActions = () => {
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const nav = useNavigation()
    const { addVisitedUrl } = useVisitedUrls()
    const { increaseDappCounter } = useNotifications()
    const tabs = useAppSelector(selectTabs)
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

            //Handle if the tab is already open or open a new one
            const hasActiveTab = tabs.findIndex(tab => tab.href === dapp.href)

            if (hasActiveTab === -1) {
                dispatch(openTab({ id: uuidv4(), href: dapp.href, title: dapp.name }))
            } else {
                dispatch(setCurrentTab(tabs[hasActiveTab].id))
            }

            //Navigate to the tab
            nav.navigate(Routes.BROWSER, { url: dapp.href })
        },
        [addVisitedUrl, checkPermissions, dispatch, increaseDappCounter, nav, track, tabs],
    )

    return { onDAppPress }
}
