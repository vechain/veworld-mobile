import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    onOpenBottomsheet: () => void
}

const useReceive = (onOpenBottomsheet: () => void) => {
    const track = useAnalyticTracking()
    return useCallback(() => {
        onOpenBottomsheet()
        track(AnalyticsEvent.TOKEN_RECEIVE_CLICKED)
    }, [onOpenBottomsheet, track])
}

const ReceiveButton = ({ onOpenBottomsheet }: Props) => {
    const { LL } = useI18nContext()
    const onReceive = useReceive(onOpenBottomsheet)

    return (
        <GlassButtonWithLabel
            label={LL.BALANCE_ACTION_RECEIVE()}
            size="sm"
            icon="icon-qr-code"
            onPress={onReceive}
            themed
            truncateText
        />
    )
}

ReceiveButton.use = useReceive

export { ReceiveButton }
