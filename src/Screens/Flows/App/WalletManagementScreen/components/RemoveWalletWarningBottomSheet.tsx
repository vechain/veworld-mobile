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
import { COLORS, isSmallScreen } from "~Constants"
import { PlatformUtils } from "~Utils"
import { StyleSheet } from "react-native"

type Props = {
    onClose: () => void
    onConfirm: () => void
}

export const RemoveWalletWarningBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onConfirm }, ref) => {
    const { LL } = useI18nContext()

    // Holds the state of the user's acknowledgement of the warning
    const [isChecked, setChecked] = React.useState(false)

    const handleOnProceed = useCallback(() => {
        onConfirm()
        onClose()
    }, [onClose, onConfirm])

    const snapPoints = useMemo(() => {
        if (PlatformUtils.isAndroid()) {
            return ["70%"]
        }

        if (isSmallScreen) return ["80%"]

        return ["60%"]
    }, [])

    return (
        <BaseBottomSheet ref={ref} snapPoints={snapPoints} onDismiss={onClose}>
            <ScrollViewWithFooter
                footer={
                    <BaseView>
                        <CheckBoxWithText
                            text={LL.BTN_WALLET_CONFRIM_DELETION()}
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
                }
                isScrollEnabled={false}>
                <BaseView>
                    <BaseText typographyFont="subTitleBold">
                        {LL.BTN_REMOVE_WALLET()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subSubTitleLight">
                        {LL.BD_WALLET_REMOVAL()}
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

                    {PlatformUtils.isAndroid() && (
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
