import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { useFeatureFlags } from "~Components"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils, PlatformUtils } from "~Utils"

const useSell = () => {
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const { paymentProvidersFeature } = useFeatureFlags()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const onPress = useCallback(() => {
        nav.navigate(Routes.SELL_FLOW)
        track(AnalyticsEvent.TOKEN_BUY_CLICKED)
    }, [nav, track])

    const disabled = useMemo(() => {
        if (!PlatformUtils.isAndroid()) return true
        if (!paymentProvidersFeature.coinify.android) return true
        if (AccountUtils.isObservedAccount(selectedAccount)) return true
        return false
    }, [paymentProvidersFeature.coinify.android, selectedAccount])

    return useMemo(
        () => ({
            disabled,
            onPress,
        }),
        [disabled, onPress],
    )
}

const SellButton = () => {
    const { LL } = useI18nContext()
    const { onPress, disabled } = useSell()

    if (disabled) return null

    return <GlassButtonWithLabel label={LL.BALANCE_ACTION_SELL()} size="sm" icon="icon-minus" onPress={onPress} />
}

SellButton.use = useSell

export { SellButton }
