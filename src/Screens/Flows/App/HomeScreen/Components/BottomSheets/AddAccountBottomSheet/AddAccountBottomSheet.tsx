import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { useCreateAccount } from "~Common"
import { BaseSpacer, BaseText, BaseView, BaseButton } from "~Components"
import { Device } from "~Storage"
import { DevicesList } from "./DevicesList"
import { BottomSheetFooter, BottomSheetFooterProps } from "@gorhom/bottom-sheet"
import { StyleSheet } from "react-native"

type Props = {
    onClose: () => void
}

const AddAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose }, ref) => {
        const createAccountFor = useCreateAccount()

        const [selectedDevice, setSelectedDevice] = useState<Device>()

        const snapPoints = useMemo(() => ["50%", "75%"], [])

        const onCreateAccount = useCallback(() => {
            if (selectedDevice) {
                createAccountFor(selectedDevice)
                onClose()
            }
        }, [createAccountFor, onClose, selectedDevice])

        const handleSheetChanges = useCallback((index: number) => {
            console.log("addAccountSheet position changed", index)
        }, [])

        const renderItem = useCallback(
            (props: BottomSheetFooterProps) => (
                <BottomSheetFooter
                    {...props}
                    style={baseStyles.bottomSheetFooter}
                    bottomInset={24}>
                    <BaseButton
                        disabled={!selectedDevice}
                        action={onCreateAccount}
                        w={100}
                        title={"Add Account"}
                    />
                </BottomSheetFooter>
            ),
            [selectedDevice, onCreateAccount],
        )
        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                ref={ref}
                footerComponent={renderItem}>
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
                    inBottomSheet={true}
                />

                {/* <BaseSpacer height={16} />
                <BaseButton
                    disabled={!selectedDevice}
                    action={onCreateAccount}
                    w={100}
                    title={"Add Account"}
                />
                <BaseSpacer height={16} /> */}
            </BaseBottomSheet>
        )
    },
)

export default AddAccountBottomSheet

const baseStyles = StyleSheet.create({
    bottomSheetFooter: { paddingHorizontal: 24, paddingVertical: 24 },
})
