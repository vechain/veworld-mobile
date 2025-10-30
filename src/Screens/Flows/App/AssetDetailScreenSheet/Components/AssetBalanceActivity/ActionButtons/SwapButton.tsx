import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const SwapButton = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const nav = useNavigation()

    const onSwap = useCallback(() => {
        nav.navigate(Routes.SWAP)
        track(AnalyticsEvent.TOKEN_SWAP_CLICKED)
    }, [nav, track])

    return <GlassButtonWithLabel label={LL.SWAP()} size="sm" icon="icon-arrow-left-right" onPress={onSwap} />
}
