import React, { useCallback, useEffect } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseText,
    BaseView,
    BaseBottomSheet,
    showErrorToast,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useDisclosure } from "~Hooks"
import { BarCodeScanningResult, Camera, CameraType } from "expo-camera"
import { COLORS, ScanTarget } from "~Constants"
import { BarCodeScanner } from "expo-barcode-scanner"
import { StyleSheet } from "react-native"
import { AddressUtils, WalletConnectUtils } from "~Utils"
import { QrScannerLayout } from "./components/QrScannerLayout"
import { CameraHeader } from "./components/CameraHeader"
import { CameraFooter } from "./components/CameraFooter"

type Props = {
    onScan: (address: string) => void
    onClose: () => void
    target: ScanTarget
    hasPerms: boolean
}

const snapPoints = ["100%"]

export const ScanBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, onScan, target, hasPerms }, ref) => {
        const { LL } = useI18nContext()

        const { isOpen, onClose: closeCamera } = useDisclosure(true)
        const { isOpen: isCameraReady, onOpen: onCameraReady } =
            useDisclosure(false)

        //called when the camera detects a qr code
        const onQrScanned = useCallback(
            (result: BarCodeScanningResult) => {
                if (target === ScanTarget.ADDRESS) {
                    const isValidAddress = AddressUtils.isValid(result.data)
                    if (isValidAddress) {
                        onClose()
                        onScan(result.data)
                    }
                } else if (target === ScanTarget.WALLET_CONNECT) {
                    const isValidWalletConnectUri =
                        WalletConnectUtils.isValidURI(result.data)

                    onClose()

                    if (isValidWalletConnectUri) {
                        onScan(result.data)
                    } else {
                        showErrorToast(
                            LL.NOTIFICATION_wallet_connect_invalid_uri(),
                        )
                    }
                }
            },
            [onScan, onClose, LL, target],
        )

        const onPasteFromClipboard = useCallback(
            (result: string) => {
                if (target === ScanTarget.ADDRESS) {
                    const isValidAddress = AddressUtils.isValid(result)
                    if (isValidAddress) {
                        onClose()
                        onScan(result)
                    }
                } else if (target === ScanTarget.WALLET_CONNECT) {
                    const isValidWalletConnectUri =
                        WalletConnectUtils.isValidURI(result)

                    onClose()

                    if (isValidWalletConnectUri) {
                        onScan(result)
                    } else {
                        showErrorToast(
                            LL.NOTIFICATION_wallet_connect_invalid_uri(),
                        )
                    }
                }
            },
            [onScan, onClose, LL, target],
        )

        // do not render camera when component unmounts
        useEffect(() => {
            return () => {
                closeCamera()
            }
        }, [closeCamera])

        return (
            <BaseBottomSheet
                handleComponent={null}
                noMargins={true}
                snapPoints={snapPoints}
                ref={ref}>
                {!hasPerms ? (
                    <>
                        <BaseView
                            style={StyleSheet.absoluteFill}
                            bg={COLORS.DARK_PURPLE}
                            justifyContent="center"
                            flexGrow={1}
                            alignItems="center">
                            <BaseText color="white">
                                {LL.COMMON_BTN_LOADING()}
                            </BaseText>
                        </BaseView>
                    </>
                ) : (
                    isOpen && (
                        <Camera
                            style={baseStyles.camera}
                            type={CameraType.back}
                            onCameraReady={onCameraReady}
                            barCodeScannerSettings={{
                                barCodeTypes: [
                                    BarCodeScanner.Constants.BarCodeType.qr,
                                ],
                            }}
                            onBarCodeScanned={onQrScanned}
                            onMountError={onClose}
                            ratio={"16:9"}>
                            {isCameraReady && (
                                <QrScannerLayout
                                    color={COLORS.DARK_PURPLE_RBGA}
                                />
                            )}
                            <CameraHeader onClose={onClose} />
                            {target === ScanTarget.WALLET_CONNECT && (
                                <CameraFooter onPaste={onPasteFromClipboard} />
                            )}
                        </Camera>
                    )
                )}
            </BaseBottomSheet>
        )
    },
)

const baseStyles = StyleSheet.create({
    camera: {
        flex: 1,
    },
})
