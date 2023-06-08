import React, { useCallback } from "react"
import { useBottomSheetModal } from "~Common"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
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
            <BaseText typographyFont="subTitle">
                {"Connect your wallet with WalletConnect to make transactions."}
            </BaseText>
            <BaseSpacer height={14} />
            <BaseButton action={openScanAddressSheet} title="New Connection" />
            <ScanWalletConnectBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onScan}
            />
        </>
    )
}
