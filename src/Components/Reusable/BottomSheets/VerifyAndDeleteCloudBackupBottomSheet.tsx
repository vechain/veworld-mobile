import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { DefaultBottomSheet } from "./DefaultBottomSheet"

type Props = {
    onClose: () => void
    onProceedToDelete: () => void
}

export const VerifyAndDeleteCloudBackupBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onProceedToDelete }, ref) => {
        const { LL } = useI18nContext()

        const handleProceedToDelete = useCallback(() => {
            onProceedToDelete()
            onClose()
        }, [onClose, onProceedToDelete])

        return (
            <DefaultBottomSheet
                ref={ref}
                title={LL.SB_BACKUP_VERIFIED()}
                description={LL.SB_BACKUP_VERIFIED_DESCRIPTION()}
                secondaryButton={{
                    label: LL.BTN_DELETE_BACKUP_FROM_CLOUD({ cloudType: "iCloud" }),
                    action: handleProceedToDelete,
                }}
                iconName="cloud-outline"
                onClose={onClose}
            />
        )
    },
)
