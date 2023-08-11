import React, { useCallback, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseButton,
    BaseBottomSheet,
    BaseView,
} from "~Components"
import { DevicesList } from "./DevicesList"
import { useI18nContext } from "~i18n"
import { useAppDispatch } from "~Storage/Redux"
import { addAccountForDevice } from "~Storage/Redux/Actions"
import { BaseDevice } from "~Model"
import { info } from "~Utils"
import { useSetSelectedAccount } from "~Hooks"

type Props = {
    onSuccess?: () => void
}

const snapPoints = ["60%"]

export const AddAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onSuccess }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const [selectedDevice, setSelectedDevice] = useState<BaseDevice>()

    const onCreateAccount = useCallback(() => {
        if (selectedDevice) {
            onSetSelectedAccount({})
            dispatch(addAccountForDevice(selectedDevice))
            setSelectedDevice(undefined)
            onSuccess?.()
        }
    }, [dispatch, onSetSelectedAccount, onSuccess, selectedDevice])

    const handleSheetChanges = useCallback((index: number) => {
        info("addAccountSheet position changed", index)
    }, [])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            ref={ref}>
            <BaseView justifyContent="space-between" flexGrow={1}>
                <BaseView flexGrow={1}>
                    <BaseText typographyFont="subTitleBold">
                        {LL.SB_CHOOSE_A_WALLET()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <DevicesList
                        selectedDevice={selectedDevice}
                        onDevicePress={setSelectedDevice}
                        inBottomSheet={false}
                    />
                </BaseView>
                <BaseButton
                    haptics="Medium"
                    disabled={!selectedDevice}
                    action={onCreateAccount}
                    w={100}
                    title={LL.BTN_ADD_ACCOUNT()}
                />
            </BaseView>
        </BaseBottomSheet>
    )
})
