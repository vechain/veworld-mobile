import { useCallback } from "react"
import { DiscoveryDApp, AnalyticsEvent } from "~Constants"
import { addNavigationToDApp, selectTabs, useAppDispatch, openTab, setCurrentTab, useAppSelector } from "~Storage/Redux"
import { useAnalyticTracking, useVisitedUrls } from "~Hooks"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { useNotifications } from "~Components"
import { uuidv4 } from "@walletconnect/utils"

export const useDAppActions = () => {
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const nav = useNavigation()
    const { addVisitedUrl } = useVisitedUrls()
    const { increaseDappCounter } = useNotifications()
    const tabs = useAppSelector(selectTabs)

    const onDAppPress = useCallback(
        (dapp: DiscoveryDApp) => {
            track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
                url: dapp.href,
            })

            addVisitedUrl(dapp.href)

            if (dapp.veBetterDaoId) {
                increaseDappCounter(dapp.veBetterDaoId)
            }

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
        [addVisitedUrl, dispatch, increaseDappCounter, nav, track, tabs],
    )

    return { onDAppPress }
}
