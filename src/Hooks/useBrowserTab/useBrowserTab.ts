import { useNavigation } from "@react-navigation/native"
import { uuidv4 } from "@walletconnect/utils"
import { useCallback, useMemo } from "react"
import { Routes } from "~Navigation"
import {
    openTab,
    selectCurrentScreen,
    selectTabs,
    setCurrentTab,
    setLastNavigationSource,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type NavigateWithTabArgs = {
    url: string
    title: string
    navigationFn?: (url: string) => void
}

export const useBrowserTab = (sourceScreen?: Routes) => {
    const dispatch = useAppDispatch()
    const tabs = useAppSelector(selectTabs)
    const nav = useNavigation()
    const currentScreen = useAppSelector(selectCurrentScreen)

    const navigateWithTab = useCallback(
        ({ url, title, navigationFn = u => nav.navigate(Routes.BROWSER, { url: u }) }: NavigateWithTabArgs) => {
            //Handle if the tab is already open or open a new one
            const hasActiveTab = tabs.findIndex(tab => tab.href === url)

            if (hasActiveTab === -1) {
                dispatch(openTab({ id: uuidv4(), href: url, title: title }))
            } else {
                dispatch(setCurrentTab(tabs[hasActiveTab].id))
            }

            dispatch(setLastNavigationSource({ screen: sourceScreen ?? currentScreen }))

            //Navigate to the tab
            navigationFn(url)
        },
        [currentScreen, dispatch, nav, sourceScreen, tabs],
    )

    const memoized = useMemo(() => ({ navigateWithTab }), [navigateWithTab])

    return memoized
}
