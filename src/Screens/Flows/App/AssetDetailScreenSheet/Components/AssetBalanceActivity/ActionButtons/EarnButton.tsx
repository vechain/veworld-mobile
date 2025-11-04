import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent, STARGATE_DAPP_URL } from "~Constants"
import { useAnalyticTracking, useBrowserNavigation } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"

const useEarn = () => {
    const track = useAnalyticTracking()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()
    const { navigateToBrowser } = useBrowserNavigation()

    return useCallback(() => {
        navigateToBrowser(STARGATE_DAPP_URL, url => nav.replace(Routes.BROWSER, { url, returnScreen: Routes.HOME }))
        track(AnalyticsEvent.TOKEN_EARN_CLICKED)
    }, [navigateToBrowser, nav, track])
}

const EarnButton = () => {
    const { LL } = useI18nContext()

    const onEarn = useEarn()

    return (
        <GlassButtonWithLabel
            label={LL.BALANCE_ACTION_EARN()}
            size="sm"
            icon={"icon-stargate"}
            onPress={onEarn}
            themed
        />
    )
}

EarnButton.use = useEarn
export { EarnButton }
