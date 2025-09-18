import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { BaseView } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { GlassButtonWithLabel } from "./GlassButton"

export const BalanceActions = () => {
    const { LL } = useI18nContext()

    const nav = useNavigation()
    const track = useAnalyticTracking()
    const onBuy = useCallback(() => {
        nav.navigate(Routes.BUY_FLOW)
        track(AnalyticsEvent.BUY_CRYPTO_BUTTON_CLICKED)
    }, [nav, track])

    const onSend = useCallback(() => nav.navigate(Routes.SELECT_TOKEN_SEND), [nav])

    return (
        <BaseView alignSelf="center" flexDirection="row" gap={24}>
            <GlassButtonWithLabel label={LL.BALANCE_ACTION_BUY()} icon="icon-plus" onPress={onBuy} />
            <GlassButtonWithLabel label={LL.BALANCE_ACTION_RECEIVE()} icon="icon-arrow-down" onPress={() => {}} />
            <GlassButtonWithLabel label={LL.BALANCE_ACTION_SEND()} icon="icon-arrow-up" onPress={onSend} />
            <GlassButtonWithLabel label={LL.BALANCE_ACTION_OTHER()} icon="icon-more-vertical" onPress={() => {}} />
        </BaseView>
    )
}
