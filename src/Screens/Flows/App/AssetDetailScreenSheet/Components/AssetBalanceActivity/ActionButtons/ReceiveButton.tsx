import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    onOpenBottomsheet: () => void
}

export const ReceiveButton = ({ onOpenBottomsheet }: Props) => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()
    const onReceive = useCallback(() => {
        onOpenBottomsheet()
        track(AnalyticsEvent.TOKEN_RECEIVE_CLICKED)
    }, [onOpenBottomsheet, track])

    return (
        <GlassButtonWithLabel label={LL.BALANCE_ACTION_RECEIVE()} size="sm" icon="icon-qr-code" onPress={onReceive} />
    )
}
