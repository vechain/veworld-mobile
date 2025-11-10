import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent, VeDelegate } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"

type Props = {
    token: FungibleTokenWithBalance
}

const useSwap = (token: FungibleTokenWithBalance) => {
    const track = useAnalyticTracking()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()

    const disabled = useMemo(() => {
        return token.symbol === VeDelegate.symbol
    }, [token.symbol])

    const onPress = useCallback(() => {
        nav.replace(Routes.SWAP)
        track(AnalyticsEvent.TOKEN_SWAP_CLICKED)
    }, [nav, track])

    return { disabled, onPress }
}

const SwapButton = ({ token }: Props) => {
    const { LL } = useI18nContext()

    const { disabled, onPress } = useSwap(token)

    return (
        <GlassButtonWithLabel
            label={LL.SWAP()}
            size="sm"
            icon="icon-arrow-left-right"
            onPress={onPress}
            disabled={disabled}
            themed
            truncateText
        />
    )
}

SwapButton.use = useSwap

export { SwapButton }
