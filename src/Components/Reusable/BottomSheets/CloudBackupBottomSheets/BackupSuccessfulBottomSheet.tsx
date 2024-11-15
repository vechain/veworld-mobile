import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { useTheme } from "~Hooks"
import { FeatherCheckCircleIconSVG } from "~Assets"
import { DefaultBottomSheet } from "~Components"
import { PlatformUtils } from "~Utils"

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
                onClose={handleOnProceed}
                description={LL.BACKUP_SUCCESSFUL_DESCRIPTION({
                    cloudType: PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE(),
                })}
                mainButton={{ label: LL.COMMON_BTN_OK(), action: handleOnProceed }}
                iconComponent={<FeatherCheckCircleIconSVG width={64} height={64} fill={theme.colors.text} />}
            />
        )
    },
)
