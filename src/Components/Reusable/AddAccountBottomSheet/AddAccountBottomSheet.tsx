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
import { selectDevices, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { addAccountForDevice } from "~Storage/Redux/Actions"
import { BaseDevice } from "~Model"
import { useScrollableBottomSheet, useSetSelectedAccount } from "~Hooks"

type Props = {
    onSuccess?: () => void
}

const snapPoints = ["60%", "90%"]

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

    const devices = useAppSelector(selectDevices)
    const { flatListScrollProps, handleSheetChangePosition } =
        useScrollableBottomSheet({ data: devices, snapPoints })

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            onChange={handleSheetChangePosition}>
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
                        devices={devices}
                        flatListScrollProps={flatListScrollProps}
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
