import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, CheckBoxWithText } from "~Components"
import { useI18nContext } from "~i18n"
import { AnalyticsEvent, COLORS } from "~Constants"
import { StyleSheet } from "react-native"
import { PlatformUtils } from "~Utils"
import { useAnalyticTracking } from "~Hooks"

type Props = {
    onClose: () => void
    onConfirm: () => void
    isUpgradeSecurity?: boolean
}

export const BackupWarningBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onConfirm, isUpgradeSecurity = false }, ref) => {
        const { LL } = useI18nContext()
        const track = useAnalyticTracking()

        // Holds the state of the user's acknowledgement of the warning
        const [isChecked, setChecked] = React.useState(false)

        const handleOnProceed = useCallback(() => {
            track(AnalyticsEvent.NEW_WALLET_PROCEED_TO_VERIFY)
            onConfirm()
            onClose()
            setChecked(false)
        }, [onClose, onConfirm, track])

        const onDismiss = useCallback(() => {
            setChecked(false)
        }, [])

        return (
            <BaseBottomSheet ref={ref} dynamicHeight onDismiss={onDismiss}>
                <BaseView>
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">{LL.TITLE_BACKUP_YOUR_PHRASE()}</BaseText>
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subSubTitleLight">{LL.SB_BACKUP_YOUR_PHRASE()}</BaseText>
                        <BaseText typographyFont="subSubTitle">{LL.SB_BACKUP_YOUR_PHRASE_2()}</BaseText>

                        <BaseSpacer height={24} />

                        {/* Warning ICON */}
                        <BaseView justifyContent="center" alignItems="center">
                            <BaseView justifyContent="center" bg={COLORS.PASTEL_ORANGE} style={baseStyles.warningIcon}>
                                <BaseIcon my={8} size={55} name="icon-alert-triangle" color={COLORS.MEDIUM_ORANGE} />
                            </BaseView>
                        </BaseView>

                        <BaseSpacer height={24} />

                        {PlatformUtils.isAndroid() && isUpgradeSecurity && (
                            <BaseText typographyFont="subSubTitle" pt={4}>
                                {LL.SB_UPGRADE_SECURITY_WARNING_ANDROID()}
                            </BaseText>
                        )}
                    </BaseView>
                    <BaseView>
                        <CheckBoxWithText
                            isChecked={isChecked}
                            text={LL.BTN_SECURITY_OPERATION_CHECKBOX()}
                            checkAction={setChecked}
                            testID="security-operation-app-checkbox"
                        />

                        <BaseSpacer height={4} />

                        <BaseButton
                            w={100}
                            haptics="Light"
                            title={LL.COMMON_PROCEED()}
                            disabled={!isChecked}
                            action={handleOnProceed}
                        />
                        <BaseSpacer height={16} />
                    </BaseView>
                </BaseView>
            </BaseBottomSheet>
        )
    },
)

const baseStyles = StyleSheet.create({
    warningIcon: {
        width: 120,
        height: 120,
        borderRadius: 24,
    },
})
