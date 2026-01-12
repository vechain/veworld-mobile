import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useIsOnline } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"

const useBuy = () => {
    const track = useAnalyticTracking()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()

    const isOnline = useIsOnline()
    const onPress = useCallback(() => {
        nav.replace(Routes.BUY_FLOW)
        track(AnalyticsEvent.TOKEN_BUY_CLICKED)
    }, [nav, track])

    return useMemo(() => ({ onPress, disabled: !isOnline }), [isOnline, onPress])
}

const BuyButton = () => {
    const { LL } = useI18nContext()
    const { onPress, disabled } = useBuy()

    return (
        <GlassButtonWithLabel
            label={LL.BALANCE_ACTION_BUY()}
            size="sm"
            icon="icon-plus"
            onPress={onPress}
            themed
            truncateText
            disabled={disabled}
        />
    )
}

BuyButton.use = useBuy

export { BuyButton }
