import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseButton, BaseBottomSheet } from "~Components"
import { DevicesList } from "./DevicesList"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { useAppDispatch } from "~Storage/Redux"
import { addAccountForDevice } from "~Storage/Redux/Actions"
import { Device } from "~Model"
import { info } from "~Common"

type Props = {
    onClose: () => void
}

export const AddAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const [selectedDevice, setSelectedDevice] = useState<Device>()

    const snapPoints = useMemo(() => ["75%"], [])

    const onCreateAccount = useCallback(() => {
        if (selectedDevice) {
            dispatch(addAccountForDevice(selectedDevice))
            onClose()
        }
    }, [dispatch, onClose, selectedDevice])

    const handleSheetChanges = useCallback((index: number) => {
        info("addAccountSheet position changed", index)
    }, [])

    // const renderFooter = useCallback(
    //     (props: BottomSheetFooterProps) => (
    //         <BottomSheetFooter
    //             {...props}
    //             style={baseStyles.bottomSheetFooter}
    //             bottomInset={24}>
    //             <BaseButton
    //                 disabled={!selectedDevice}
    //                 action={onCreateAccount}
    //                 w={100}
    //                 title={"Add Account"}
    //             />
    //         </BottomSheetFooter>
    //     ),
    //     [selectedDevice, onCreateAccount],
    // )

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            ref={ref}
            contentStyle={baseStyles.contentStyle}
            footerStyle={baseStyles.footerStyle}
            footer={
                <BaseButton
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
    // bottomSheetFooter: { paddingHorizontal: 24, paddingVertical: 24 },
    contentStyle: { flex: 0.85 },
    footerStyle: { flex: 0.15, paddingBottom: 24 },
})
