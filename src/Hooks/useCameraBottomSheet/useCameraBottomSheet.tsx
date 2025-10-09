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

export const useCameraBottomSheet = ({ targets, sourceScreen, title, description, ...rest }: Args) => {
    const { ref: scanAddressSheetRef, onOpen: openScanAddressSheet } = useBottomSheetModal()

    const handleOpenCamera = useCallback(
        <TTabs extends SendReceiveBsTab[]>(args: SendReceiveBottomSheetOpenProps<TTabs>) => {
            Keyboard.dismiss()
            openScanAddressSheet(args)
        },
        [openScanAddressSheet],
    )

    const handleOpenOnlyScanCamera = useCallback(() => {
        Keyboard.dismiss()
        openScanAddressSheet({ tabs: ["scan"], defaultTab: "scan" })
    }, [openScanAddressSheet])

    const onScan = useScanTargets({ targets, sourceScreen, ...rest })

    const RenderCameraModal = useMemo(
        () => (
            <SendReceiveBottomSheet ref={scanAddressSheetRef} onScan={onScan} title={title} description={description} />
        ),
        [scanAddressSheetRef, onScan, title, description],
    )

    return { RenderCameraModal, handleOpenCamera, handleOpenOnlyScanCamera }
}
