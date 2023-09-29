import React, { useCallback, useMemo } from "react"
import { useBottomSheetModal, useCameraPermissions } from "~Hooks"
import { ScanBottomSheet } from "~Components"
import { ScanTarget } from "~Constants"
import { Keyboard } from "react-native"

export const useCameraBottomSheet = ({
    onScan,
    targets,
}: {
    onScan: (uri: string) => void
    targets: ScanTarget[]
}) => {
    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    const { checkPermissions } = useCameraPermissions({
        onCanceled: closeScanAddressSheetRef,
    })

    const handleOpenCamera = useCallback(async () => {
        Keyboard.dismiss()
        if (await checkPermissions()) openScanAddressSheet()
    }, [checkPermissions, openScanAddressSheet])

    const RenderCameraModal = useMemo(
        () => (
            <ScanBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
                target={targets}
            />
        ),
        [scanAddressSheetRef, closeScanAddressSheetRef, onScan, targets],
    )

    return { RenderCameraModal, handleOpenCamera }
}
