import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { useCreateAccount } from "~Common"
import { BaseSpacer, BaseText, BaseTouchableBox } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { Device, useListListener, useRealm } from "~Storage"

type Props = {
    activeDevice: Device
    onClose: () => void
}

const HomeScreenBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ activeDevice, onClose }, ref) => {
        const createAccountFor = useCreateAccount()
        const nav = useNavigation()
        const { store } = useRealm()
        const devices = useListListener(Device.getName(), store) as Device[]

        const snapPoints = useMemo(() => ["50%"], [])

        const navigateToCreateWallet = useCallback(() => {
            nav.navigate(Routes.CREATE_WALLET_FLOW)
        }, [nav])

        const onCreateAccount = useCallback(() => {
            createAccountFor(activeDevice)
            onClose()
        }, [createAccountFor, onClose, activeDevice])

        const handleSheetChanges = useCallback((index: number) => {
            console.log("handleSheetChanges", index)
        }, [])

        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                ref={ref}>
                <BaseTouchableBox action={onCreateAccount}>
                    <BaseText>Add Account</BaseText>
                </BaseTouchableBox>
                <BaseSpacer height={16} />
                <BaseTouchableBox action={navigateToCreateWallet}>
                    <BaseText>Add Wallet ({devices.length} available)</BaseText>
                </BaseTouchableBox>
            </BaseBottomSheet>
        )
    },
)

export default HomeScreenBottomSheet
