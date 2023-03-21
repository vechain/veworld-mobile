import React, { useCallback, useEffect, useState } from "react"
import { BaseModal, IBaseModal } from "~Components"
import { BaseText, BaseView } from "~Components"
import { Camera, useCameraDevices } from "react-native-vision-camera"
import { useScanBarcodes, BarcodeFormat } from "vision-camera-code-scanner"
import { Dimensions, StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { QrScannerLayout } from "./Components/QrScannerLayout"
import { CameraHeader } from "./Components/CameraHeader"
import { PlatformUtils, useCameraPermissions, useTheme } from "~Common"
import { useConfirmAddress } from "./hooks/useConfirmAddress"
import { getScannedAddress, useRealm } from "~Storage"

const deviceWidth = Dimensions.get("window").width
const deviceHeight = Dimensions.get("window").height

interface IQRCodeScanner extends Omit<IBaseModal, "children"> {
    onCameraSuccess?: (isShowSend: boolean) => void
    isShowSend?: boolean
}
export const QRCodeScanner: React.FC<IQRCodeScanner> = ({
    isOpen,
    isShowSend,
    onClose,
}) => {
    const { LL } = useI18nContext()
    const devices = useCameraDevices()
    const theme = useTheme()
    const { checkPermissions, hasPerms, isCanceled } = useCameraPermissions()
    const device = devices.back
    const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE])
    const [isShowUI, setIsShowUI] = useState(false)
    const { isConfirmed, address } = useConfirmAddress(barcodes)
    const { cache } = useRealm()

    useEffect(() => {
        if (isConfirmed && address) {
            const scannedAddress = getScannedAddress(cache)
            cache.write(() => (scannedAddress.address = address))
            onClose()
        }
    }, [address, cache, isConfirmed, isShowSend, onClose])

    useEffect(() => {
        isCanceled && onClose()
    }, [isCanceled, onClose])

    useEffect(() => {
        async function init() {
            await checkPermissions()
        }
        init()
    }, [checkPermissions])

    const onInitialized = useCallback(() => {
        setIsShowUI(prev => !prev)
    }, [])

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} hasSafeArea={false}>
            {!device ? (
                <BaseView
                    style={StyleSheet.absoluteFill}
                    bg={theme.colors.darkPurple}
                    justifyContent="center"
                    flexGrow={1}
                    alignItems="center">
                    <BaseText color="white">{LL.COMMON_BTN_LOADING()}</BaseText>
                </BaseView>
            ) : (
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
                            isActive={true}
                            onInitialized={onInitialized}
                            frameProcessor={frameProcessor}
                            frameProcessorFps={1}
                            lowLightBoost
                        />
                    )}
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
