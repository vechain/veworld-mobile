import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    CardButton,
    ScrollViewWithFooter,
} from "~Components"
import { useI18nContext } from "~i18n"
import { isSmallScreen } from "~Constants"
import { PlatformUtils } from "~Utils"
import { Device } from "~Model"

type Props = {
    onClose: () => void
    onConfirm: () => void
    selectedDevice?: Device
}

export const RemoveWalletWarningBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onConfirm, selectedDevice }, ref) => {
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

        return ["60%"]
    }, [])

    return (
        <BaseBottomSheet ref={ref} snapPoints={snapPoints} onDismiss={onClose}>
            <ScrollViewWithFooter
                footer={
                    <BaseView>
                        <BaseButton
                            w={100}
                            haptics="Light"
                            title={LL.BTN_REMOVE_WALLET().toUpperCase()}
                            action={handleOnProceed}
                        />
                        <BaseSpacer height={16} />

                        <BaseButton
                            variant="outline"
                            w={100}
                            haptics="Light"
                            title={LL.COMMON_BTN_CANCEL().toUpperCase()}
                            action={onClose}
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

                    <BaseSpacer height={16} />

                    <CardButton title={selectedDevice?.alias || ""} />
                </BaseView>
            </ScrollViewWithFooter>
        </BaseBottomSheet>
    )
})
