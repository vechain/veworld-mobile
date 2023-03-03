import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { useCreateAccount } from "~Common"
import { BaseSpacer, BaseText, BaseView, BaseButton } from "~Components"
import { Device } from "~Storage"
import { DevicesList } from "./DevicesList"

type Props = {
    onClose: () => void
}

const AddAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose }, ref) => {
        const createAccountFor = useCreateAccount()

        const [selectedDevice, setSelectedDevice] = useState<Device>()

        const snapPoints = useMemo(() => ["50%"], [])

        const onCreateAccount = useCallback(() => {
            if (selectedDevice) {
                createAccountFor(selectedDevice)
                onClose()
            }
        }, [createAccountFor, onClose, selectedDevice])

        const handleSheetChanges = useCallback((index: number) => {
            console.log("addAccountSheet position changed", index)
        }, [])

        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                ref={ref}>
                <BaseText typographyFont="subTitle">Choose a wallet</BaseText>
                <BaseView
                    orientation="row"
                    justify="space-between"
                    w={100}
                    align="center"
                />
                <BaseSpacer height={16} />
                <DevicesList
                    selectedDevice={selectedDevice}
                    onDevicePress={setSelectedDevice}
                />

                <BaseSpacer height={16} />
                <BaseButton
                    disabled={!selectedDevice}
                    action={onCreateAccount}
                    w={100}
                    title={"Add Account"}
                />
                <BaseSpacer height={16} />
            </BaseBottomSheet>
        )
    },
)

export default AddAccountBottomSheet
