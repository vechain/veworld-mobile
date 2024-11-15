import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { PlatformUtils } from "~Utils"
import { DefaultBottomSheet } from "../DefaultBottomSheet"

type Props = {
    onClose: () => void
    onProceedToDelete: () => void
}

export const BackupVerifiedBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
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
                description={LL.SB_BACKUP_VERIFIED_DESCRIPTION({
                    cloudType: PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE(),
                })}
                secondaryButton={{
                    label: LL.BTN_DELETE_BACKUP_FROM_CLOUD({
                        cloudType: PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE(),
                    }),
                    action: handleProceedToDelete,
                }}
                iconName="cloud-outline"
                onClose={onClose}
            />
        )
    },
)
