import React, { useCallback } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ConvertBetterBottomSheet } from "~Screens/Flows/App/AssetDetailScreen/Components"

export const ConvertButton = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()

    const { ref: ref, onOpen: onOpen, onClose: onClose } = useBottomSheetModal()

    const onPress = useCallback(() => {
        onOpen()
        track(AnalyticsEvent.TOKEN_CONVERT_CLICKED)
    }, [onOpen, track])

    return (
        <>
            <GlassButtonWithLabel label={LL.BTN_CONVERT()} size="sm" icon="icon-refresh-cw" onPress={onPress} />
            <ConvertBetterBottomSheet ref={ref} onClose={onClose} />
        </>
    )
}
