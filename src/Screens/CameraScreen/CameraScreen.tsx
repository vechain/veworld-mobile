import React, { useEffect, useState } from "react"
import { BaseText, BaseView } from "~Components"
import { Dimensions, StyleSheet, View } from "react-native"
import { useI18nContext } from "~i18n"
import { QrScannerLayout } from "./Components/QrScannerLayout"
import { CameraHeader } from "./Components/CameraHeader"
import { useCameraPermissions, useTheme } from "~Common"
import { useConfirmAddress } from "./hooks/useConfirmAddress"
import { Camera, CameraType } from "expo-camera"
import { BarCodeScanner } from "expo-barcode-scanner"
import { useCamDisclosure } from "./hooks/useCamDisclosure"

const deviceWidth = Dimensions.get("window").width

export const CameraScreen = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { checkPermissions, hasPerms, isCanceled } = useCameraPermissions()
    const [isCameraReady, setIsCameraReady] = useState(false)
    const { isConfirmed, confirmAddress, address } = useConfirmAddress()
    const { onClose, isActive } = useCamDisclosure()

    useEffect(() => {
        if (isConfirmed && address) onClose()
    }, [address, isConfirmed, onClose])

    useEffect(() => {
        if (isCanceled) onClose()
    }, [isCanceled, onClose])

    useEffect(() => {
        async function init() {
            await checkPermissions()
        }
        init()
    }, [checkPermissions])

    if (!hasPerms)
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
        <View
            style={[
                baseStyles.container,
                { backgroundColor: theme.colors.darkPurple },
            ]}>
            {isActive && (
                <Camera
                    style={baseStyles.camera}
                    type={CameraType.back}
                    onCameraReady={() => setIsCameraReady(prev => !prev)}
                    barCodeScannerSettings={{
                        barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                    }}
                    onBarCodeScanned={confirmAddress}
                    onMountError={onClose}
                    ratio={"16:9"}>
                    {isCameraReady && (
                        <QrScannerLayout color={theme.colors.darkPurpleRGBA} />
                    )}
                    <CameraHeader onClose={onClose} />
                </Camera>
            )}
        </View>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        width: deviceWidth,
    },
    camera: {
        flex: 1,
    },
})
