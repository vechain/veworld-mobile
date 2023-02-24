import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { Device } from "~Model"
import { useCreateAccount } from "~Common"
import { BaseText, BaseTouchableBox } from "~Components"

type Props = {
    activeDevice: Device
    onClose: () => void
}

const HomeScreenBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ activeDevice, onClose }, ref) => {
        const createAccountFor = useCreateAccount()

        const snapPoints = useMemo(() => ["50%"], [])

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
                <BaseTouchableBox action={onCreateAccount}>
                    <BaseText>Add Wallet</BaseText>
                </BaseTouchableBox>
            </BaseBottomSheet>
        )
    },
)

export default HomeScreenBottomSheet
