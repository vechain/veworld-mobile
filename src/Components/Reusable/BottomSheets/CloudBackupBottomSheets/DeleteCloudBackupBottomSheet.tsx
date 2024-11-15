import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { PlatformUtils } from "~Utils"
import { DefaultBottomSheet } from "../DefaultBottomSheet"

type Props = {
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
}

export const DeleteCloudBackupBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onConfirm, isLoading }, ref) => {
        const { LL } = useI18nContext()

        return (
            <DefaultBottomSheet
                ref={ref}
                iconName="trash-can-outline"
                title={LL.SB_CONFIRM_DELETE()}
                description={LL.SB_CONFIRM_DELETE_DESCRIPTION({
                    cloudType: PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE(),
                })}
                mainButton={{
                    label: isLoading ? LL.SB_DELETING_CLOUD_BACKUP() : LL.BTN_DELETE_BACKUP_FROM_CLOUD_CONFIRM(),
                    action: onConfirm,
                    caution: true,
                }}
                secondaryButton={{
                    label: LL.COMMON_BTN_CANCEL(),
                    action: onClose,
                }}
                onClose={onClose}
            />
        )
    },
)
