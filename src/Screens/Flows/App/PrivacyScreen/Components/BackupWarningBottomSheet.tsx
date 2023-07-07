import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
    ScrollViewWithFooter,
} from "~Components"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"
import { StyleSheet } from "react-native"
import { PlatformUtils } from "~Utils"

type Props = {
    onClose: () => void
    onConfirm: () => void
    isUpgradeSecurity?: boolean
}

export const BackupWarningBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onConfirm, isUpgradeSecurity = false }, ref) => {
    const { LL } = useI18nContext()

    // Holds the state of the user's acknowledgement of the warning
    const [isChecked, setChecked] = React.useState(false)

    const handleOnProceed = useCallback(() => {
        onConfirm()
        onClose()
        setChecked(false)
    }, [onClose, onConfirm])

    const onDismiss = useCallback(() => {
        setChecked(false)
    }, [])

    const snapPoints = useMemo(() => {
        if (PlatformUtils.isAndroid() && isUpgradeSecurity) {
            return ["70%"]
        }
        return ["60%"]
    }, [isUpgradeSecurity])

    return (
        <BaseBottomSheet
            ref={ref}
            snapPoints={snapPoints}
            onDismiss={onDismiss}>
            <ScrollViewWithFooter
                footer={
                    <BaseView>
                        <CheckBoxWithText
                            text={LL.BTN_SECURITY_OPERATION_CHECKBOX()}
                            checkAction={setChecked}
                            testID="security-operation-app-checkbox"
                        />

                        <BaseSpacer height={4} />

                        <BaseButton
                            w={100}
                            haptics="light"
                            title={LL.COMMON_PROCEED()}
                            disabled={!isChecked}
                            action={handleOnProceed}
                        />
                        <BaseSpacer height={16} />
                    </BaseView>
                }
                isScrollEnabled={false}>
                <BaseView>
                    <BaseText typographyFont="subTitleBold">
                        {LL.TITLE_BACKUP_YOUR_PHRASE()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subSubTitleLight">
                        {LL.SB_BACKUP_YOUR_PHRASE()}
                    </BaseText>
                    <BaseText typographyFont="subSubTitle">
                        {LL.SB_BACKUP_YOUR_PHRASE_2()}
                    </BaseText>

                    <BaseSpacer height={24} />

                    {/* Warning ICON */}
                    <BaseView justifyContent="center" alignItems="center">
                        <BaseView
                            justifyContent="center"
                            bg={COLORS.PASTEL_ORANGE}
                            style={baseStyles.warningIcon}>
                            <BaseIcon
                                my={8}
                                size={55}
                                name="alert-outline"
                                color={COLORS.MEDIUM_ORANGE}
                            />
                        </BaseView>
                    </BaseView>

                    <BaseSpacer height={24} />

                    {PlatformUtils.isAndroid() && isUpgradeSecurity && (
                        <BaseText typographyFont="subSubTitle" pt={4}>
                            {LL.SB_UPGRADE_SECURITY_WARNING_ANDROID()}
                        </BaseText>
                    )}
                </BaseView>
            </ScrollViewWithFooter>
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    warningIcon: {
        width: 120,
        height: 120,
        borderRadius: 24,
    },
})
