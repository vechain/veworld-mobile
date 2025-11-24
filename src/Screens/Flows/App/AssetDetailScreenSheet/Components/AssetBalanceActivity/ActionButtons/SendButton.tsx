import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { Keyboard } from "react-native"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent, VeDelegate } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils, BigNutils } from "~Utils"

type Props = {
    token: FungibleTokenWithBalance
}

const useSend = (token: FungibleTokenWithBalance) => {
    const track = useAnalyticTracking()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const onSend = useCallback(() => {
        Keyboard.dismiss()
        nav.navigate(Routes.SEND_TOKEN)
        track(AnalyticsEvent.TOKEN_SEND_CLICKED)
    }, [nav, track])

    const isSendDisabled = useMemo(
        () =>
            BigNutils(token.balance.balance).isZero ||
            AccountUtils.isObservedAccount(selectedAccount) ||
            token.symbol === VeDelegate.symbol,
        [selectedAccount, token.balance.balance, token.symbol],
    )

    return useMemo(
        () => ({
            disabled: isSendDisabled,
            onPress: onSend,
        }),
        [isSendDisabled, onSend],
    )
}

const SendButton = ({ token }: Props) => {
    const { LL } = useI18nContext()

    const { disabled, onPress } = useSend(token)

    return (
        <GlassButtonWithLabel
            label={LL.BALANCE_ACTION_SEND()}
            size="sm"
            icon="icon-arrow-up"
            onPress={onPress}
            disabled={disabled}
            themed
            truncateText
        />
    )
}

SendButton.use = useSend

export { SendButton }
