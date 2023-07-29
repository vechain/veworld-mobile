import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    ScrollViewWithFooter,
} from "~Components"
import { useI18nContext } from "~i18n"
import { isSmallScreen } from "~Constants"
import { PlatformUtils } from "~Utils"

type Props = {
    onClose: () => void
    onConfirm: () => void
}

export const RemoveAccountWarningBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onConfirm }, ref) => {
    const { LL } = useI18nContext()

    const handleOnProceed = useCallback(() => {
        onConfirm()
        onClose()
    }, [onClose, onConfirm])

    const snapPoints = useMemo(() => {
        if (PlatformUtils.isAndroid()) {
            return ["70%"]
        }

        if (isSmallScreen) return ["80%"]

        return ["50%"]
    }, [])

    return (
        <BaseBottomSheet ref={ref} snapPoints={snapPoints} onDismiss={onClose}>
            <ScrollViewWithFooter
                footer={
                    <BaseView>
                        <BaseSpacer height={4} />

                        <BaseButton
                            w={100}
                            haptics="Light"
                            title={LL.COMMON_PROCEED()}
                            action={handleOnProceed}
                        />
                        <BaseSpacer height={16} />
                    </BaseView>
                }
                isScrollEnabled={false}>
                <BaseView>
                    <BaseText typographyFont="subTitleBold">
                        {LL.BTN_REMOVE_ACCOUNT()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subSubTitleLight">
                        {LL.BD_ACCOUNT_REMOVAL()}
                    </BaseText>

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
