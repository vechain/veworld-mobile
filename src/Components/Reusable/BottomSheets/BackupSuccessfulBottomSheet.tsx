import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { useCallback } from "react"
import { useI18nContext } from "~i18n"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { PlatformUtils } from "~Utils"

type Props = {
    onConfirm: () => void
}

export const BackupSuccessfulBottomSheet = React.forwardRef<BottomSheetModal, Props>(({ onConfirm }, ref) => {
    const { LL } = useI18nContext()

    const handleOnProceed = useCallback(() => {
        onConfirm()
    }, [onConfirm])

    const mainButton = (
        <BaseButton
            w={100}
            typographyFont="buttonMedium"
            haptics="Light"
            title={LL.COMMON_BTN_OK()}
            action={handleOnProceed}
        />
    )

    return (
        <DefaultBottomSheet
            ref={ref}
            title={LL.BACKUP_SUCCESSFUL_TITLE()}
            description={LL.BACKUP_SUCCESSFUL_DESCRIPTION({
                cloudType: PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE(),
            })}
            mainButton={mainButton}
            enablePanDownToClose={false}
            icon="icon-check-circle"
        />
    )
})
