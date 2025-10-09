import React, { useCallback, useMemo } from "react"
import { Keyboard } from "react-native"
import {
    SendReceiveBottomSheet,
    SendReceiveBottomSheetOpenProps,
    SendReceiveBsTab,
} from "~Components/Reusable/BottomSheets/SendReceiveBottomSheet"
import { useBottomSheetModal } from "~Hooks"
import { UseScanTargetArgs, useScanTargets } from "~Hooks/useScanTargets"

type Args = UseScanTargetArgs & {
    title?: string
    description?: string
}

export const useCameraBottomSheet = ({ targets, overrides, sourceScreen, title, description }: Args) => {
    const { ref: scanAddressSheetRef, onOpen: openScanAddressSheet } = useBottomSheetModal()

    const handleOpenCamera = useCallback(
        async <TTabs extends SendReceiveBsTab[]>(args: SendReceiveBottomSheetOpenProps<TTabs>) => {
            Keyboard.dismiss()
            openScanAddressSheet(args)
        },
        [openScanAddressSheet],
    )

    const onScan = useScanTargets({ targets, overrides, sourceScreen })

    const RenderCameraModal = useMemo(
        () => (
            <SendReceiveBottomSheet ref={scanAddressSheetRef} onScan={onScan} title={title} description={description} />
        ),
        [scanAddressSheetRef, onScan, title, description],
    )

    return { RenderCameraModal, handleOpenCamera }
}
