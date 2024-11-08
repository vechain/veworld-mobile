import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Hooks"
import { CheckCircleSVG } from "~Assets"
import { DefaultBottomSheet } from "./DefaultBottomSheet"

type Props = {
    onClose: () => void
    onConfirm: () => void
}

export const BackupSuccessfulBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onConfirm }, ref) => {
        const { LL } = useI18nContext()
        const theme = useTheme()

        const handleOnProceed = useCallback(() => {
            onConfirm()
            onClose()
        }, [onClose, onConfirm])

        return (
            <DefaultBottomSheet
                ref={ref}
                title={LL.BACKUP_SUCCESSFUL_TITLE()}
                description={LL.BACKUP_SUCCESSFUL_DESCRIPTION({ cloudType: "iCloud" })}
                mainButton={{ label: LL.COMMON_BTN_OK(), action: handleOnProceed }}
                iconComponent={<CheckCircleSVG size={66} color={theme.colors.text} />}
                onClose={onClose}
            />
        )
    },
)
