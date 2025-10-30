import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { Routes } from "~Navigation"
import { BigNutils } from "~Utils"

type Props = {
    token: FungibleTokenWithBalance
}

export const SendButton = ({ token }: Props) => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const nav = useNavigation()
    const onSend = useCallback(() => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            token,
        })
        track(AnalyticsEvent.TOKEN_SEND_CLICKED)
    }, [nav, token, track])

    const isSendDisabled = useMemo(() => BigNutils(token.balance.balance).isZero, [token.balance.balance])

    return (
        <GlassButtonWithLabel
            label={LL.BALANCE_ACTION_SEND()}
            size="sm"
            icon="icon-arrow-up"
            onPress={onSend}
            disabled={isSendDisabled}
        />
    )
}
