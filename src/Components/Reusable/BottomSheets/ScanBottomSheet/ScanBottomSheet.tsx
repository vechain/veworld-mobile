import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BarcodeScanningResult, CameraView } from "expo-camera"
import React, { useCallback, useEffect } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseView, showWarningToast } from "~Components"
import { COLORS, ScanTarget, SCREEN_WIDTH } from "~Constants"
import { useDisclosure } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BackHandlerEvent } from "~Model"
import HapticsService from "~Services/HapticsService"
import { AddressUtils, URIUtils, WalletConnectUtils } from "~Utils"
import { CameraFooter } from "./components/CameraFooter"
import { CameraHeader } from "./components/CameraHeader"

const QR_SCAN_SQUARE_SIZE = SCREEN_WIDTH - 80
type Props = {
    onScan: (address: string) => void
    onClose: () => void
    target: ScanTarget[]
}

const snapPoints = ["100%"]

export const ScanBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose, onScan, target }, ref) => {
    const { LL } = useI18nContext()

    const { isOpen, onClose: closeCamera } = useDisclosure(true)
    const { isOpen: isCameraReady, onOpen: onCameraReady } = useDisclosure(false)

    // Handles the common scan logic for all targets
    const handleScan = useCallback(
        (data: string) => {
            const isAddressTarget = target.includes(ScanTarget.ADDRESS)
            const isWalletConnectTarget = target.includes(ScanTarget.WALLET_CONNECT)
            const isVnsTarget = target.includes(ScanTarget.VNS)
            const isUrl = target.includes(ScanTarget.HTTPS_URL)

            if (isVnsTarget && data.includes(".vet")) {
                onScan(data)
                onClose()
                return
            }

            let coinbaseQRcodeClean = AddressUtils.coinbaseQRcodeAddress(data)

            const isValidAddress = isAddressTarget && AddressUtils.isValid(coinbaseQRcodeClean)
            const isValidWalletConnectUri = isWalletConnectTarget && WalletConnectUtils.validateUri(data).isValid
            const isValidHttpsUrl = isUrl && URIUtils.isValid(data) && URIUtils.isHttps(data)

            if (isValidAddress || isValidWalletConnectUri || isValidHttpsUrl) {
                onScan(isAddressTarget ? coinbaseQRcodeClean : data)
            } else {
                let toastProps = {
                    text1: LL.NOTIFICATION_TITLE_INVALID_QR(),
                    text2: "",
                    visibilityTime: 4000,
                }

                if (isWalletConnectTarget && !isAddressTarget) {
                    // If target is only wallet connect
                    toastProps = {
                        ...toastProps,
                        text2: LL.NOTIFICATION_wallet_connect_invalid_uri(),
                    }
                } else if (isAddressTarget && !isWalletConnectTarget) {
                    // If target is only address
                    toastProps = {
                        ...toastProps,
                        text2: LL.ERROR_INVALID_ADDRESS(),
                    }
                } else {
                    // General error message
                    toastProps = {
                        ...toastProps,
                        text2: LL.NOTIFICATION_INVALID_QR(),
                        visibilityTime: 6000,
                    }
                }

                HapticsService.triggerImpact({ level: "Light" })
                showWarningToast(toastProps)
            }

            onClose()
        },
        [target, onClose, onScan, LL],
    )

    const onQrScanned = useCallback(
        (result: BarcodeScanningResult) => {
            handleScan(result.data)
        },
        [handleScan],
    )

    const onPasteFromClipboard = useCallback(
        (result: string) => {
            handleScan(result)
        },
        [handleScan],
    )

    // do not render camera when component unmounts
    useEffect(() => {
        return () => {
            closeCamera()
        }
    }, [closeCamera])

    return (
        <BaseBottomSheet
            bottomSafeArea={false}
            handleComponent={null}
            noMargins={true}
            snapPoints={snapPoints}
            ref={ref}
            backHandlerEvent={BackHandlerEvent.BLOCK}>
            {isOpen && (
                <CameraView
                    style={baseStyles.camera}
                    onCameraReady={onCameraReady}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    onBarcodeScanned={onQrScanned}
                    onMountError={onClose}
                    ratio="16:9">
                    <BaseView style={baseStyles.container} w={100} h={100}>
                        {isCameraReady && <BaseView style={baseStyles.square} />}

                        <CameraHeader onClose={onClose} />

                        {target.includes(ScanTarget.WALLET_CONNECT) && <CameraFooter onPaste={onPasteFromClipboard} />}
                    </BaseView>
                </CameraView>
            )}
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    camera: {
        flex: 1,
    },
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    square: {
        borderWidth: 3,
        borderColor: COLORS.WHITE,
        width: QR_SCAN_SQUARE_SIZE,
        height: QR_SCAN_SQUARE_SIZE,
        borderRadius: 40,
    },
})
