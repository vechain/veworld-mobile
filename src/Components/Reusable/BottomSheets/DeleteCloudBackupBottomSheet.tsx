import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { DefaultBottomSheet } from "./DefaultBottomSheet"

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
                iconName="alert-circle-outline"
                title={LL.SB_CONFIRM_DELETE()}
                description={LL.SB_CONFIRM_DELETE_DESCRIPTION()}
                mainButton={{
                    label: isLoading ? LL.SB_DELETING_CLOUD_BACKUP() : LL.BTN_DELETE_BACKUP_FROM_CLOUD_CONFIRM(),
                    action: onConfirm,
                    caution: true,
                }}
                secondaryButton={{
                    label: LL.BTN_NO_GO_BACK(),
                    action: onClose,
                }}
                onClose={onClose}
            />
        )
    },
)
