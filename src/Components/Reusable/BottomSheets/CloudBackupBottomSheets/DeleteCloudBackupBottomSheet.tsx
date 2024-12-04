import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { PlatformUtils } from "~Utils"
import { DefaultBottomSheet } from "../DefaultBottomSheet"
import { BaseButton } from "~Components"
import { StyleSheet } from "react-native"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    onClose: () => void
    onProceedToDelete: () => void
}

export const DeleteCloudBackupBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onProceedToDelete }, ref) => {
        const { LL } = useI18nContext()
        const { styles, theme } = useThemedStyles(baseStyles)
        const cloudType = PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE()

        const handleProceedToDelete = useCallback(() => {
            onProceedToDelete()
            onClose()
        }, [onClose, onProceedToDelete])

        const secondaryButton = (
            <BaseButton
                w={100}
                style={styles.secondaryButton}
                variant="outline"
                textColor={theme.colors.text}
                typographyFont="buttonMedium"
                haptics="Light"
                title={LL.BTN_DELETE_BACKUP_FROM_CLOUD({
                    cloudType: PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE(),
                })}
                action={handleProceedToDelete}
            />
        )

        return (
            <DefaultBottomSheet
                ref={ref}
                title={LL.SB_BACKUP_VERIFIED()}
                description={LL.SB_BACKUP_VERIFIED_DESCRIPTION({
                    cloudType: cloudType,
                    repeatCloudType: cloudType,
                })}
                secondaryButton={secondaryButton}
                icon="cloud-outline"
            />
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        secondaryButton: {
            borderRadius: 8,
            paddingVertical: 14,
            borderColor: theme.colors.text,
        },
    })
