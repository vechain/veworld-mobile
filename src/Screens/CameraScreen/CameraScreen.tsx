import React, { useCallback, useEffect, useState } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { Camera, useCameraDevices } from "react-native-vision-camera"
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner"
import { Dimensions, StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { QrScannerLayout } from "./Components/QrScannerLayout"
import { CameraHeader } from "./Components/CameraHeader"
import { useCamDisclosure } from "./hooks/useCamDisclosure"
import { useTheme } from "~Common"
import { useConfirmAddress } from "./hooks/useConfirmAddress"
import { getScannedAddress, useRealm } from "~Storage"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListHome, Routes } from "~Navigation"

const deviceWidth = Dimensions.get("window").width
const deviceHeight = Dimensions.get("window").height

type Props = {} & NativeStackScreenProps<RootStackParamListHome, Routes.CAMERA>

export const CameraScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const devices = useCameraDevices()
    const theme = useTheme()
    const device = devices.back
    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE])
    const [isShowUI, setIsShowUI] = useState(false)
    const { onClose, isActive } = useCamDisclosure()
    const { isConfirmed, address } = useConfirmAddress(barcodes)
    const { cache } = useRealm()

    useEffect(() => {
        if (isConfirmed && address && route.params) {
            let params = route.params
            const scannedAddress = getScannedAddress(cache)
            cache.write(() => {
                scannedAddress.address = address
                scannedAddress.isShowSend = params.showSendFlow
            })
            onClose()
        }
    }, [address, cache, isConfirmed, onClose, route.params])

    const onInitialized = useCallback(() => {
        setIsShowUI(prev => !prev)
    }, [])

    if (!device)
        return (
            <BaseView
                style={StyleSheet.absoluteFill}
                background="black"
                justify="center"
                grow={1}
                align="center">
                <BaseText color="white">{LL.COMMON_BTN_LOADING()}</BaseText>
            </BaseView>
        )

    return (
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

            {isShowUI && (
                <QrScannerLayout color={theme.colors.darkPurpleRGBA} />
            )}

            <Camera
                style={baseStyles.camera}
                device={device}
                isActive={isActive}
                onInitialized={onInitialized}
                frameProcessor={frameProcessor}
                frameProcessorFps={1}
                lowLightBoost
            />
        </BaseView>
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
