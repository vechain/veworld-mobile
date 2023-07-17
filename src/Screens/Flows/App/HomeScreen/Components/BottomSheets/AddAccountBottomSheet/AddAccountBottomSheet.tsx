import React, { useCallback, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseButton, BaseBottomSheet } from "~Components"
import { DevicesList } from "./DevicesList"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { useAppDispatch } from "~Storage/Redux"
import { addAccountForDevice } from "~Storage/Redux/Actions"
import { BaseDevice } from "~Model"
import { info } from "~Utils"
import { useSetSelectedAccount } from "~Hooks"

type Props = {
    onClose: () => void
}

const snapPoints = ["75%"]

export const AddAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const [selectedDevice, setSelectedDevice] = useState<BaseDevice>()

    const onCreateAccount = useCallback(() => {
        if (selectedDevice) {
            onSetSelectedAccount({})
            dispatch(addAccountForDevice(selectedDevice))
            setSelectedDevice(undefined)
            onClose()
        }
    }, [dispatch, onClose, onSetSelectedAccount, selectedDevice])

    const handleSheetChanges = useCallback((index: number) => {
        info("addAccountSheet position changed", index)
    }, [])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            ref={ref}
            contentStyle={baseStyles.contentStyle}
            footerStyle={baseStyles.footerStyle}
            footer={
                <BaseButton
                    haptics="Medium"
                    disabled={!selectedDevice}
                    action={onCreateAccount}
                    w={100}
                    title={LL.BTN_ADD_ACCOUNT()}
                />
            }>
            <BaseText typographyFont="subTitleBold">
                {LL.SB_CHOOSE_A_WALLET()}
            </BaseText>
            <BaseSpacer height={16} />
            <DevicesList
                selectedDevice={selectedDevice}
                onDevicePress={setSelectedDevice}
                inBottomSheet={false}
            />
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    contentStyle: { flex: 0.85 },
    footerStyle: { flex: 0.15, paddingBottom: 24 },
})
