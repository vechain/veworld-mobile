import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"

const useBuy = () => {
    const track = useAnalyticTracking()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()
    return useCallback(() => {
        nav.replace(Routes.BUY_FLOW)
        track(AnalyticsEvent.TOKEN_BUY_CLICKED)
    }, [nav, track])
}

const BuyButton = () => {
    const { LL } = useI18nContext()
    const onBuy = useBuy()

    return (
        <GlassButtonWithLabel
            label={LL.BALANCE_ACTION_BUY()}
            size="sm"
            icon="icon-plus"
            onPress={onBuy}
            themed
            truncateText
        />
    )
}

BuyButton.use = useBuy

export { BuyButton }
