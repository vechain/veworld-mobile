import React from "react"
import {
    BaseModal,
    BaseSpacer,
    BaseText,
    BaseView,
    IBaseModal,
} from "~Components"
import { Camera, useCameraDevices } from "react-native-vision-camera"
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner"
import { Dimensions, StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { QrScannerLayout } from "./Components/QrScannerLayout"
import { CameraHeader } from "./Components/CameraHeader"

interface IQRCodeReader extends Omit<IBaseModal, "children"> {
    onSuccess?: (address: string) => void
}

const deviceWidth = Dimensions.get("window").width
const deviceHeight = Dimensions.get("window").height

export const QRCodeReader: React.FC<IQRCodeReader> = ({ isOpen, onClose }) => {
    const { LL } = useI18nContext()
    const devices = useCameraDevices()
    const device = devices.back
    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE])

    console.log(barcodes)

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} hasSafeArea={false}>
            {!device ? (
                <BaseView
                    style={StyleSheet.absoluteFill}
                    background="black"
                    justify="center"
                    align="center">
                    <BaseText color="white">{LL.COMMON_BTN_LOADING()}</BaseText>
                </BaseView>
            ) : (
                <BaseView
                    grow={1}
                    w={100}
                    justify="flex-start"
                    align="center"
                    background="black">
                    <CameraHeader onClose={onClose} />

                    <BaseSpacer height={deviceHeight / 2.5} />

                    {/* this is here because even when the camera is loaded still has a minimal delay */}
                    <BaseText color="white">{LL.COMMON_BTN_LOADING()}</BaseText>

                    <QrScannerLayout />

                    <Camera
                        style={baseStyles.camera}
                        device={device}
                        isActive={isOpen}
                        frameProcessor={frameProcessor}
                        frameProcessorFps={1}
                        lowLightBoost
                    />
                </BaseView>
            )}
        </BaseModal>
    )
}

const baseStyles = StyleSheet.create({
    camera: {
        position: "absolute",
        width: deviceWidth,
        height: deviceHeight,
        zIndex: 1,
    },
})
