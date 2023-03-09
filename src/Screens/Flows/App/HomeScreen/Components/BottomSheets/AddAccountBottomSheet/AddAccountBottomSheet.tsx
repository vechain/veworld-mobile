import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { useCreateAccount } from "~Common"
import { BaseSpacer, BaseText, BaseButton } from "~Components"
import { Device } from "~Storage"
import { DevicesList } from "./DevicesList"
// import { BottomSheetFooter, BottomSheetFooterProps } from "@gorhom/bottom-sheet"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"

type Props = {
    onClose: () => void
}

export const AddAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose }, ref) => {
    const createAccountFor = useCreateAccount()

    const { LL } = useI18nContext()

    const [selectedDevice, setSelectedDevice] = useState<Device>()

    const snapPoints = useMemo(() => ["75%"], [])

    const onCreateAccount = useCallback(() => {
        if (selectedDevice) {
            createAccountFor(selectedDevice)
            onClose()
        }
    }, [createAccountFor, onClose, selectedDevice])

    const handleSheetChanges = useCallback((index: number) => {
        console.log("addAccountSheet position changed", index)
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
                    title={"Add Account"}
                />
            }>
            <BaseText typographyFont="subTitle">
                {LL.SB_CREATE_WALLET()}
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
