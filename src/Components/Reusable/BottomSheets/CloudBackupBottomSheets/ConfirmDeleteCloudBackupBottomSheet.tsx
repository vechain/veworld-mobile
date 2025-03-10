import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { PlatformUtils } from "~Utils"
import { BaseButton, DefaultBottomSheet } from "~Components"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"

type Props = {
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
}

export const ConfirmDeleteCloudBackupBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onConfirm, isLoading }, ref) => {
        const { LL } = useI18nContext()
        const { styles, theme } = useThemedStyles(baseStyles)

        const mainButton = (
            <BaseButton
                w={100}
                style={styles.cautionButton}
                textColor={COLORS.WHITE}
                typographyFont="buttonMedium"
                haptics="Light"
                title={isLoading ? LL.SB_DELETING_CLOUD_BACKUP() : LL.BTN_DELETE_BACKUP_FROM_CLOUD_CONFIRM()}
                action={onConfirm}
            />
        )

        const secondaryButton = (
            <BaseButton
                w={100}
                style={styles.secondaryButton}
                variant="outline"
                textColor={theme.colors.text}
                typographyFont="buttonMedium"
                haptics="Light"
                title={LL.COMMON_BTN_CANCEL()}
                action={onClose}
            />
        )

        return (
            <DefaultBottomSheet
                ref={ref}
                icon="icon-trash-2"
                title={LL.SB_CONFIRM_DELETE()}
                description={LL.SB_CONFIRM_DELETE_DESCRIPTION({
                    cloudType: PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE(),
                })}
                mainButton={mainButton}
                secondaryButton={secondaryButton}
            />
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        cautionButton: {
            backgroundColor: COLORS.RED_600,
            borderColor: COLORS.RED_600,
        },
        secondaryButton: {
            borderRadius: 8,
            paddingVertical: 14,
            borderColor: theme.colors.text,
        },
    })
