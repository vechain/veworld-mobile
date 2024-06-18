import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView, DeviceBox } from "~Components"
import { useI18nContext } from "~i18n"
import { BaseDevice, Device } from "~Model"

type Props = {
    onClose: () => void
    onConfirm: () => void
    selectedDevice?: Device
}

export const RemoveWalletWarningBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onConfirm, selectedDevice }, ref) => {
        const { LL } = useI18nContext()

        const handleOnProceed = useCallback(() => {
            onConfirm()
            onClose()
        }, [onClose, onConfirm])

        return (
            <BaseBottomSheet ref={ref} dynamicHeight onDismiss={onClose}>
                <BaseView>
                    <BaseText typographyFont="subTitleBold">{LL.BTN_REMOVE_WALLET()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subSubTitleLight">{LL.BD_WALLET_REMOVAL()}</BaseText>

                    <BaseSpacer height={16} />

                    <DeviceBox device={selectedDevice as BaseDevice} isIconVisible={false} />
                    <BaseSpacer height={16} />
                    <BaseView>
                        <BaseButton
                            testID="remove-wallet-button"
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
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
