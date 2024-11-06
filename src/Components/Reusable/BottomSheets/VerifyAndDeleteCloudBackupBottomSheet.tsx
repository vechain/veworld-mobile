import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"

type Props = {
    onClose: () => void
    onProceedToDelete: () => void
}

export const VerifyAndDeleteCloudBackupBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onProceedToDelete }, ref) => {
        const { LL } = useI18nContext()
        const { styles, theme } = useThemedStyles(baseStyles)

        const handleProceedToDelete = useCallback(() => {
            onProceedToDelete()
            onClose()
        }, [onClose, onProceedToDelete])

        return (
            <BaseBottomSheet
                ref={ref}
                dynamicHeight
                onDismiss={onClose}
                backgroundStyle={styles.bottomSheet}
                blurBackdrop={true}>
                <BaseView>
                    <BaseView>
                        <BaseView justifyContent="center" alignItems="center">
                            <BaseView justifyContent="center">
                                <BaseIcon
                                    name="cloud-outline"
                                    style={styles.icon}
                                    size={66}
                                    color={theme.colors.text}
                                />
                            </BaseView>
                            <BaseSpacer height={24} />
                            <BaseView justifyContent="center" alignItems="center">
                                <BaseText align="center" typographyFont="subSubTitleMedium">
                                    {LL.SB_BACKUP_VERIFIED()}
                                </BaseText>
                                <BaseSpacer height={10} />
                                <BaseText align="center" typographyFont="body">
                                    {LL.SB_BACKUP_VERIFIED_DESCRIPTION()}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={26} />
                    <BaseView>
                        <BaseButton
                            w={100}
                            typographyFont="buttonMedium"
                            variant={"outline"}
                            textColor={theme.colors.text}
                            style={[{ borderColor: theme.colors.text }]}
                            title={LL.BTN_DELETE_BACKUP_FROM_CLOUD({ cloudType: "iCloud" })}
                            action={handleProceedToDelete}
                        />
                        <BaseSpacer height={16} />
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
        bottomSheet: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.LIGHT_GRAY,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
    })
