import React, { useEffect, useState } from "react"
import { BaseText, BaseView } from "~Components"
import { Dimensions, StyleSheet, View } from "react-native"
import { useI18nContext } from "~i18n"
import { QrScannerLayout } from "./Components/QrScannerLayout"
import { CameraHeader } from "./Components/CameraHeader"
import { useCameraPermissions } from "~Common"
import { useConfirmAddress } from "./hooks/useConfirmAddress"
import { Camera, CameraType } from "expo-camera"
import { BarCodeScanner } from "expo-barcode-scanner"
import { useCamDisclosure } from "./hooks/useCamDisclosure"
import { useAppDispatch } from "~Storage/Redux"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { COLORS } from "~Common/Theme"

const deviceWidth = Dimensions.get("window").width

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CAMERA>

export const CameraScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const { checkPermissions, hasPerms, isCanceled } = useCameraPermissions()
    const [isCameraReady, setIsCameraReady] = useState(false)
    const { isConfirmed, confirmAddress, address } = useConfirmAddress()
    const { onClose, isActive } = useCamDisclosure()
    const dispatch = useAppDispatch()
    useEffect(() => {
        if (isConfirmed && address) {
            route?.params?.onScan?.(address)
            onClose()
        }
    }, [address, dispatch, isConfirmed, onClose, route?.params])

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
                bg={COLORS.DARK_PURPLE}
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
                { backgroundColor: COLORS.DARK_PURPLE },
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
                        <QrScannerLayout color={COLORS.DARK_PURPLE_RBGA} />
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
