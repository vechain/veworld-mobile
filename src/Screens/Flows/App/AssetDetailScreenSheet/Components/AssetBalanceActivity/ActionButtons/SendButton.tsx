import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
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
    /**
     * Optional handler to open the new send flow.
     * When not provided, the legacy navigation flow is used.
     */
    onOpenSendFlow?: () => void
}

const useSend = (token: FungibleTokenWithBalance, onOpenSendFlow?: () => void) => {
    const track = useAnalyticTracking()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const onSend = useCallback(() => {
        if (onOpenSendFlow) {
            // New V2 flow
            onOpenSendFlow()
        } else {
            // Legacy behavior.
            nav.replace(Routes.INSERT_ADDRESS_SEND, {
                token,
            })
        }
        track(AnalyticsEvent.TOKEN_SEND_CLICKED)
    }, [nav, onOpenSendFlow, token, track])

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

const SendButton = ({ token, onOpenSendFlow }: Props) => {
    const { LL } = useI18nContext()

    const { disabled, onPress } = useSend(token, onOpenSendFlow)

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
