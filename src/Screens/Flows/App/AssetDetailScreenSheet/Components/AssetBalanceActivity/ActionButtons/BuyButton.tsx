import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

const useBuy = () => {
    const track = useAnalyticTracking()
    const nav = useNavigation()
    return useCallback(() => {
        nav.navigate(Routes.BUY_FLOW)
        track(AnalyticsEvent.TOKEN_BUY_CLICKED)
    }, [nav, track])
}

const BuyButton = () => {
    const { LL } = useI18nContext()
    const onBuy = useBuy()

    return <GlassButtonWithLabel label={LL.BALANCE_ACTION_BUY()} size="sm" icon="icon-plus" onPress={onBuy} />
}

BuyButton.use = useBuy

export { BuyButton }
