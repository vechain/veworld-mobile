import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { useFeatureFlags } from "~Components"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils, BigNutils } from "~Utils"
import PlatformUtils from "~Utils/PlatformUtils"

const useSell = (token: FungibleTokenWithBalance) => {
    const track = useAnalyticTracking()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListSwitch>>()
    const { paymentProvidersFeature } = useFeatureFlags()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const onPress = useCallback(() => {
        nav.replace(Routes.SELL_FLOW)
        track(AnalyticsEvent.TOKEN_BUY_CLICKED)
    }, [nav, track])

    const disabled = useMemo(() => {
        if (!PlatformUtils.isAndroid()) return true
        if (!paymentProvidersFeature.coinify.android) return true
        if (AccountUtils.isObservedAccount(selectedAccount)) return true
        if (BigNutils(token.balance.balance).isZero) return true
        return false
    }, [paymentProvidersFeature.coinify.android, selectedAccount, token.balance.balance])

    return useMemo(
        () => ({
            disabled,
            onPress,
        }),
        [disabled, onPress],
    )
}

const SellButton = ({ token }: { token: FungibleTokenWithBalance }) => {
    const { LL } = useI18nContext()
    const { onPress, disabled } = useSell(token)

    if (disabled) return null

    return (
        <GlassButtonWithLabel
            label={LL.BALANCE_ACTION_SELL()}
            size="sm"
            icon="icon-minus"
            onPress={onPress}
            themed
            truncateText
            testID="SELL_BUTTON"
        />
    )
}

SellButton.use = useSell

export { SellButton }
