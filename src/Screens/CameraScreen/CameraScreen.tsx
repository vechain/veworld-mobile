import React, { useCallback, useEffect, useState } from "react"
import { BaseText, BaseView } from "~Components"
import { Camera, useCameraDevices } from "react-native-vision-camera"
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner"
import { Dimensions, StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { QrScannerLayout } from "./Components/QrScannerLayout"
import { CameraHeader } from "./Components/CameraHeader"
import { useCamDisclosure } from "./hooks/useCamDisclosure"
import { useCameraPermissions, useTheme } from "~Common"
import { useConfirmAddress } from "./hooks/useConfirmAddress"
import { getScannedAddress, useRealm } from "~Storage"

const deviceWidth = Dimensions.get("window").width
const deviceHeight = Dimensions.get("window").height

export const CameraScreen = () => {
    const { LL } = useI18nContext()
    const { checkPermissions, hasPerms, isCanceled } = useCameraPermissions()
    const devices = useCameraDevices()
    const theme = useTheme()
    const device = devices.back
    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE])
    const [isShowUI, setIsShowUI] = useState(false)
    const { onClose, isActive } = useCamDisclosure()
    const { isConfirmed, address } = useConfirmAddress(barcodes)
    const { cache } = useRealm()

    useEffect(() => {
        if (isConfirmed && address) {
            const scannedAddress = getScannedAddress(cache)
            if (scannedAddress.isShowSend) {
                cache.write(() => (scannedAddress.address = address))
                // navigate to send flow on same stack
            } else {
                cache.write(() => (scannedAddress.address = address))
                onClose()
            }
        }
    }, [address, cache, isConfirmed, onClose])

    useEffect(() => {
        isCanceled && onClose()
    }, [isCanceled, onClose])

    const onInitialized = useCallback(() => {
        setIsShowUI(prev => !prev)
    }, [])

    useEffect(() => {
        async function init() {
            await checkPermissions()
        }
        init()
    }, [checkPermissions])

    if (!device)
        return (
            <BaseView
                style={StyleSheet.absoluteFill}
                background={theme.colors.darkPurple}
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
            background={theme.colors.darkPurple}>
            <CameraHeader onClose={onClose} />

            {isShowUI && (
                <QrScannerLayout color={theme.colors.darkPurpleRGBA} />
            )}

            {hasPerms && (
                <Camera
                    style={baseStyles.camera}
                    device={device}
                    isActive={isActive}
                    onInitialized={onInitialized}
                    frameProcessor={frameProcessor}
                    frameProcessorFps={1}
                    lowLightBoost
                />
            )}
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
