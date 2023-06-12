import React, { useCallback } from "react"
import { useBottomSheetModal } from "~Hooks"
import {
    BaseButton,
    ScanWalletConnectBottomSheet,
    useWalletConnect,
} from "~Components"

export const ConnectAppButton = () => {
    const { onPair } = useWalletConnect()

    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    const onScan = useCallback(
        (uri: string) => {
            onPair(uri)
        },
        [onPair],
    )

    return (
        <>
            <BaseButton action={openScanAddressSheet} title="New Connection" />
            <ScanWalletConnectBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
            />
        </>
    )
}
