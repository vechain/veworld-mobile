import React, { useCallback, useEffect } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseText, BaseView, BaseBottomSheet } from "~Components"
import { useI18nContext } from "~i18n"
import { useCameraPermissions, useDisclosure } from "~Common"
import { BarCodeScanningResult, Camera, CameraType } from "expo-camera"
import { COLORS } from "~Common/Theme"
import { BarCodeScanner } from "expo-barcode-scanner"
import { StyleSheet } from "react-native"
import { AddressUtils } from "~Utils"
import { QrScannerLayout } from "./components/QrScannerLayout"
import { CameraHeader } from "./components/CameraHeader"

type Props = {
    onScan: (address: string) => void
    onClose: () => void
}

const snapPoints = ["100%"]

export const ScanAddressBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onScan }, ref) => {
    const { LL } = useI18nContext()

    const { checkPermissions, hasPerms } = useCameraPermissions({
        onCanceled: onClose,
    })

    const { isOpen, onClose: closeCamera } = useDisclosure(true)
    const { isOpen: isCameraReady, onOpen: onCameraReady } =
        useDisclosure(false)

    //called when the camera detects a qr code
    const onQrScanned = useCallback(
        (result: BarCodeScanningResult) => {
            const isValidAddress = AddressUtils.isValid(result.data)
            if (isValidAddress) {
                onClose()
                onScan(result.data)
            }
        },
        [onScan, onClose],
    )

    // do not render camera when component unmounts
    useEffect(() => {
        return () => {
            closeCamera()
        }
    }, [closeCamera])

    useEffect(() => {
        async function init() {
            await checkPermissions()
        }
        init()
    }, [checkPermissions])

    return (
        <BaseBottomSheet
            handleComponent={null}
            noMargins={true}
            snapPoints={snapPoints}
            ref={ref}>
            {!hasPerms ? (
                <BaseView
                    style={StyleSheet.absoluteFill}
                    bg={COLORS.DARK_PURPLE}
                    justifyContent="center"
                    flexGrow={1}
                    alignItems="center">
                    <BaseText color="white">{LL.COMMON_BTN_LOADING()}</BaseText>
                </BaseView>
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
                            <QrScannerLayout color={COLORS.DARK_PURPLE_RBGA} />
                        )}
                        <CameraHeader />
                    </Camera>
                )
            )}
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    camera: {
        flex: 1,
    },
})
