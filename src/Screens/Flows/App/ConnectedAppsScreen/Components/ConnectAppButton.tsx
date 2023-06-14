import React, { useCallback } from "react"
import { useBottomSheetModal } from "~Hooks"
import { BaseButton, ScanBottomSheet, useWalletConnect } from "~Components"
import { ScanType } from "~Constants"

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
            <ScanBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
                scanType={ScanType.WALLET_CONNECT}
            />
        </>
    )
}
