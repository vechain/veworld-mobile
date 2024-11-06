import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import { COLORS, ColorThemeType } from "~Constants"

type Props = {
    onClose: () => void
    onConfirm: () => void
    isLoading?: boolean
}

export const DeleteCloudBackupBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onConfirm, isLoading }, ref) => {
        const { LL } = useI18nContext()
        const { styles, theme } = useThemedStyles(baseStyles)

        return (
            <BaseBottomSheet ref={ref} dynamicHeight onDismiss={onClose} blurBackdrop={true}>
                <BaseView>
                    <BaseView>
                        <BaseView justifyContent="center" alignItems="center">
                            <BaseIcon name="alert-circle-outline" size={68} color={theme.colors.text} />
                            <BaseSpacer height={24} />
                            <BaseView justifyContent="center" alignItems="center">
                                <BaseText align="center" typographyFont="subSubTitleMedium">
                                    {LL.SB_CONFIRM_DELETE()}
                                </BaseText>
                                <BaseSpacer height={10} />
                                <BaseText align="center" typographyFont="body">
                                    {LL.SB_CONFIRM_DELETE_DESCRIPTION()}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={26} />
                    <BaseView>
                        <BaseButton
                            w={100}
                            style={styles.confirmDeletionButton}
                            textColor={COLORS.WHITE}
                            typographyFont="buttonMedium"
                            title={
                                isLoading ? LL.SB_DELETING_CLOUD_BACKUP() : LL.BTN_DELETE_BACKUP_FROM_CLOUD_CONFIRM()
                            }
                            action={onConfirm}
                        />
                        <BaseSpacer height={16} />
                        <BaseButton
                            w={100}
                            typographyFont="buttonMedium"
                            variant="outline"
                            title={LL.BTN_NO_GO_BACK()}
                            action={onClose}
                        />
                    </BaseView>
                </BaseView>
            </BaseBottomSheet>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        icon: {
            color: theme.colors.text,
            marginTop: 8,
        },
        confirmDeletionButton: {
            backgroundColor: COLORS.RED_600,
            borderColor: COLORS.RED_600,
            borderWidth: 1,
        },
    })
