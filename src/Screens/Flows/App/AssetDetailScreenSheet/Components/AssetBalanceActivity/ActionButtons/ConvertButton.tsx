import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject, useCallback, useMemo } from "react"
import { GlassButtonWithLabel } from "~Components/Reusable/GlassButton/GlassButton"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"

type Props = {
    bsRef: RefObject<BottomSheetModalMethods>
}

const useConvert = (bsRef: RefObject<BottomSheetModalMethods>) => {
    const track = useAnalyticTracking()
    const { onOpen: onOpen } = useBottomSheetModal({ externalRef: bsRef })
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const onPress = useCallback(() => {
        onOpen()
        track(AnalyticsEvent.TOKEN_CONVERT_CLICKED)
    }, [onOpen, track])

    const disabled = useMemo(() => AccountUtils.isObservedAccount(selectedAccount), [selectedAccount])

    return useMemo(
        () => ({
            onPress,
            disabled,
        }),
        [disabled, onPress],
    )
}

const ConvertButton = ({ bsRef }: Props) => {
    const { LL } = useI18nContext()

    const { onPress, disabled } = useConvert(bsRef)

    return (
        <GlassButtonWithLabel
            label={LL.BTN_CONVERT()}
            size="sm"
            icon="icon-refresh-cw"
            onPress={onPress}
            disabled={disabled}
            themed
        />
    )
}

ConvertButton.use = useConvert

export { ConvertButton }
