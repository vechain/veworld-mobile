import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent, STARGATE_DAPP_URL } from "~Constants"
import { useAnalyticTracking, useBrowserNavigation } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const EarnButton = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const { navigateToBrowser } = useBrowserNavigation()

    const onEarn = useCallback(() => {
        navigateToBrowser(STARGATE_DAPP_URL, url => nav.navigate(Routes.BROWSER, { url, returnScreen: Routes.HOME }))
        track(AnalyticsEvent.TOKEN_EARN_CLICKED)
    }, [navigateToBrowser, nav, track])

    return <GlassButtonWithLabel label={LL.BALANCE_ACTION_EARN()} size="sm" icon={"icon-stargate"} onPress={onEarn} />
}
