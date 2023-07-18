import React, { useCallback, useEffect, useMemo } from "react"
import { useBottomSheetModal, useCameraPermissions } from "~Hooks"
import { ScanBottomSheet } from "~Components"
import { ScanTarget } from "~Constants"
import { Keyboard } from "react-native"

export const useCameraBottomSheet = ({
    onScan,
    target,
}: {
    onScan: (uri: string) => void
    target: ScanTarget
}) => {
    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    const { checkPermissions, hasPerms } = useCameraPermissions({
        onCanceled: closeScanAddressSheetRef,
    })

    const handleOpenCamera = useCallback(async () => {
        Keyboard.dismiss()
        if (hasPerms) openScanAddressSheet()
        else await checkPermissions()
    }, [checkPermissions, hasPerms, openScanAddressSheet])

    useEffect(() => {
        Keyboard.dismiss()
        if (hasPerms) openScanAddressSheet()
    }, [hasPerms, openScanAddressSheet])

    const RenderCameraModal = useMemo(
        () => (
            <ScanBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
                target={target}
                hasPerms={hasPerms}
            />
        ),
        [
            scanAddressSheetRef,
            closeScanAddressSheetRef,
            onScan,
            target,
            hasPerms,
        ],
    )

    return { RenderCameraModal, handleOpenCamera }
}
