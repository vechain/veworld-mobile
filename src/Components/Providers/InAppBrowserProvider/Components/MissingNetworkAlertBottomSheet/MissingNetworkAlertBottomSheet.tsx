import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { RefObject } from "react"
import { BaseButton } from "~Components/Base/BaseButton"
import { DefaultBottomSheet } from "~Components/Reusable/BottomSheets/DefaultBottomSheet"
import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { useI18nContext } from "~i18n"

export const MissingNetworkAlertBottomSheet = React.forwardRef<BottomSheetModalMethods, {}>((_, ref) => {
    const { LL } = useI18nContext()
    const { ref: intenralRef, onClose } = useBottomSheetModal({
        externalRef: ref as RefObject<BottomSheetModalMethods>,
    })

    return (
        <DefaultBottomSheet
            ref={intenralRef}
            icon={"icon-alert-triangle"}
            iconSize={40}
            title={LL.MISSING_NETWORK_ALERT_BOTTOM_SHEET_TITLE()}
            description={LL.MISSING_NETWORK_ALERT_BOTTOM_SHEET_DESCRIPTION()}
            mainButton={
                <BaseButton
                    w={100}
                    title={LL.COMMON_BTN_GO_TO()}
                    action={() => {
                        onClose()
                    }}
                />
            }
            secondaryButton={
                <BaseButton
                    w={100}
                    variant="outline"
                    title={LL.COMMON_BTN_CANCEL()}
                    action={() => {
                        onClose()
                    }}
                />
            }
        />
    )
})
