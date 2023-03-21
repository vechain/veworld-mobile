import React, { useCallback, useEffect, useState } from "react"
import { BaseText, BaseView } from "~Components"
import { Camera, useCameraDevices } from "react-native-vision-camera"
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner"
import { Dimensions, StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { QrScannerLayout } from "./Components/QrScannerLayout"
import { CameraHeader } from "./Components/CameraHeader"
import { useCamDisclosure } from "./hooks/useCamDisclosure"
import { PlatformUtils, useCameraPermissions, useTheme } from "~Common"
import { useConfirmAddress } from "./hooks/useConfirmAddress"
import { getScannedAddress, useRealm } from "~Storage"
import { useNavigation } from "@react-navigation/native"

const deviceWidth = Dimensions.get("window").width
const deviceHeight = Dimensions.get("window").height

export const CameraScreen = () => {
    const { LL } = useI18nContext()
    const { checkPermissions, hasPerms, isCanceled } = useCameraPermissions()
    const devices = useCameraDevices()
    const theme = useTheme()
    const nav = useNavigation()
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
                cache.write(() => {
                    scannedAddress.address = address
                    scannedAddress.isShowSend = true
                })
            } else {
                cache.write(() => (scannedAddress.address = address))
            }
            onClose()
        }
    }, [address, cache, isConfirmed, nav, onClose])

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
                bg={theme.colors.darkPurple}
                justifyContent="center"
                flexGrow={1}
                alignItems="center">
                <BaseText color="white">{LL.COMMON_BTN_LOADING()}</BaseText>
            </BaseView>
        )

    return (
        <BaseView
            flexGrow={1}
            w={100}
            justifyContent="flex-start"
            alignItems="center"
            bg={theme.colors.darkPurple}>
            <CameraHeader onClose={onClose} />

            {isShowUI && PlatformUtils.isIOS() && (
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
