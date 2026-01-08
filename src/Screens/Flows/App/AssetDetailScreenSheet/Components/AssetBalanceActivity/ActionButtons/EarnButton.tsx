import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent, STARGATE_DAPP_URL } from "~Constants"
import { useAnalyticTracking, useBrowserNavigation, useIsOnline } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"

const useEarn = () => {
    const track = useAnalyticTracking()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()
    const { navigateToBrowser } = useBrowserNavigation()

    const isOnline = useIsOnline()
    const onPress = useCallback(() => {
        navigateToBrowser(STARGATE_DAPP_URL, url => nav.replace(Routes.BROWSER, { url, returnScreen: Routes.HOME }))
        track(AnalyticsEvent.TOKEN_EARN_CLICKED)
    }, [navigateToBrowser, nav, track])

    return useMemo(() => ({ onPress, disabled: !isOnline }), [isOnline, onPress])
}

const EarnButton = () => {
    const { LL } = useI18nContext()

    const { onPress, disabled } = useEarn()

    return (
        <GlassButtonWithLabel
            label={LL.BALANCE_ACTION_EARN()}
            size="sm"
            icon={"icon-stargate"}
            onPress={onPress}
            themed
            truncateText
            disabled={disabled}
        />
    )
}

EarnButton.use = useEarn
export { EarnButton }
