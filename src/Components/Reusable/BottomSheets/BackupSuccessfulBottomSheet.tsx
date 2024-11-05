import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useThemedStyles } from "~Hooks"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { AnalyticsEvent, COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { CheckCircleSVG } from "~Assets"

type Props = {
    onClose: () => void
    onConfirm: () => void
    isUpgradeSecurity?: boolean
}

export const BackupSuccessfulBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onConfirm }, ref) => {
        const { LL } = useI18nContext()
        const track = useAnalyticTracking()
        const { styles, theme } = useThemedStyles(baseStyles)

        const handleOnProceed = useCallback(() => {
            track(AnalyticsEvent.NEW_WALLET_PROCEED_TO_VERIFY)
            onConfirm()
            onClose()
        }, [onClose, onConfirm, track])

        return (
            <BaseBottomSheet ref={ref} dynamicHeight backgroundStyle={styles.passwordSheet} blurBackdrop={true}>
                <BaseView>
                    <BaseView>
                        <BaseView justifyContent="center" alignItems="center" style={styles.keyIcon}>
                            <BaseView justifyContent="center" style={styles.keyIcon}>
                                <CheckCircleSVG size={66} color={theme.colors.text} />
                            </BaseView>
                            <BaseSpacer height={24} />
                            <BaseView justifyContent="center" alignItems="center">
                                <BaseText align="center" typographyFont="subSubTitleMedium">
                                    {LL.BACKUP_SUCCESSFUL_TITLE()}
                                </BaseText>
                                <BaseSpacer height={8} />
                                <BaseText align="center" typographyFont="body">
                                    {LL.BACKUP_SUCCESSFUL_DESCRIPTION({ cloudType: "iCloud" })}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={24} />
                    <BaseView>
                        <BaseButton
                            w={100}
                            typographyFont="buttonMedium"
                            haptics="Light"
                            title={LL.COMMON_BTN_OK()}
                            action={handleOnProceed}
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
        keyIcon: {
            color: theme.colors.text,
            marginTop: 8,
        },
        passwordSheet: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.LIGHT_GRAY,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
        passwordInfo: {
            height: 42,
        },
    })
