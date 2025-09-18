import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import React, { RefObject, useCallback, useMemo } from "react"
import { BaseView } from "~Components"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal } from "~Hooks"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { GlassButtonWithLabel } from "./GlassButton"

type Props = {
    qrCodeBottomSheetRef: RefObject<BottomSheetModalMethods>
}

export const BalanceActions = ({ qrCodeBottomSheetRef }: Props) => {
    const { LL } = useI18nContext()

    const nav = useNavigation()
    const track = useAnalyticTracking()

    const account = useAppSelector(selectSelectedAccount)

    const { onOpen: openQRCodeSheet } = useBottomSheetModal({ externalRef: qrCodeBottomSheetRef })

    const { rawAmount } = useTotalFiatBalance({ account, enabled: true })

    const onBuy = useCallback(() => {
        nav.navigate(Routes.BUY_FLOW)
        track(AnalyticsEvent.BUY_CRYPTO_BUTTON_CLICKED)
    }, [nav, track])

    const onSend = useCallback(() => nav.navigate(Routes.SELECT_TOKEN_SEND), [nav])

    const onReceive = useCallback(() => openQRCodeSheet(), [openQRCodeSheet])

    const isSendDisabled = useMemo(() => rawAmount === 0, [rawAmount])

    return (
        <BaseView alignSelf="center" flexDirection="row" gap={24}>
            <GlassButtonWithLabel label={LL.BALANCE_ACTION_BUY()} icon="icon-plus" onPress={onBuy} />
            <GlassButtonWithLabel label={LL.BALANCE_ACTION_RECEIVE()} icon="icon-arrow-down" onPress={onReceive} />
            <GlassButtonWithLabel
                label={LL.BALANCE_ACTION_SEND()}
                icon="icon-arrow-up"
                onPress={onSend}
                disabled={isSendDisabled}
            />
            <GlassButtonWithLabel label={LL.BALANCE_ACTION_OTHER()} icon="icon-more-vertical" onPress={() => {}} />
        </BaseView>
    )
}
