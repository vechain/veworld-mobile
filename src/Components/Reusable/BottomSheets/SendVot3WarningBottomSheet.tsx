import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    onClose: () => void
    onConfirm: () => void
}

export const SendVot3WarningBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onConfirm, onClose }, ref) => {
        const { LL } = useI18nContext()

        const continueButton = (
            <BaseButton
                w={100}
                typographyFont="buttonMedium"
                haptics="Light"
                title={LL.BTN_SEND_ANYWAY()}
                action={onConfirm}
            />
        )

        const cancelButton = (
            <BaseButton
                w={100}
                variant="outline"
                typographyFont="buttonMedium"
                haptics="Light"
                title={LL.COMMON_BTN_CANCEL()}
                action={onClose}
            />
        )

        return (
            <DefaultBottomSheet
                ref={ref}
                icon="icon-alert-triangle"
                title={LL.SEND_VOT3_TITLE()}
                description={LL.SEND_VOT3_DESCRIPTION()}
                mainButton={continueButton}
                secondaryButton={cancelButton}
            />
        )
    },
)
