// import React, { useCallback, useEffect, useState } from "react"
// import { BaseModal, IBaseModal } from "~Components"
// import { BaseText, BaseView } from "~Components"
// import { Dimensions, StyleSheet, View } from "react-native"
// import { useI18nContext } from "~i18n"
// import { QrScannerLayout } from "./Components/QrScannerLayout"
// import { CameraHeader } from "./Components/CameraHeader"
// import { useCameraPermissions, useTheme } from "~Common"
// import { useConfirmAddress } from "./hooks/useConfirmAddress"
// import { Camera, CameraType } from "expo-camera"
// import { BarCodeScanner } from "expo-barcode-scanner"

// const deviceWidth = Dimensions.get("window").width

// interface IQRCodeScanner extends Omit<IBaseModal, "children"> {
//     onCameraSuccess?: (isShowSend: boolean) => void
//     isShowSend?: boolean
// }

// export const QRCodeScanner: React.FC<IQRCodeScanner> = ({
//     isOpen,
//     isShowSend,
//     onClose,
// }) => {
//     const { LL } = useI18nContext()
//     const theme = useTheme()
//     const { checkPermissions, hasPerms, isCanceled } = useCameraPermissions()
//     const [isCameraReady, setIsCameraReady] = useState(false)
//     const [randomId, setRandomId] = useState(Math.random().toString())
//     const { isConfirmed, confirmAddress, address } = useConfirmAddress()

//     useEffect(() => {
//         if (isConfirmed && address) {
//             setRandomId(Math.random().toString())
//             onClose()
//         }
//     }, [address, isConfirmed, isShowSend, onClose])

//     useEffect(() => {
//         if (isCanceled) {
//             setRandomId(Math.random().toString())
//             onClose()
//         }
//     }, [isCanceled, onClose])

//     useEffect(() => {
//         async function init() {
//             await checkPermissions()
//         }
//         isOpen && init()
//     }, [checkPermissions, isOpen])

//     if (isOpen)
//         return (
//             <BaseModal isOpen={isOpen} onClose={onClose} isSafeArea={false}>
//                 {!hasPerms ? (
//                     <BaseView
//                         style={StyleSheet.absoluteFill}
//                         bg={theme.colors.darkPurple}
//                         justifyContent="center"
//                         flexGrow={1}
//                         alignItems="center">
//                         <BaseText color="white">
//                             {LL.COMMON_BTN_LOADING()}
//                         </BaseText>
//                     </BaseView>
//                 ) : (
//                     <View
//                         style={[
//                             baseStyles.container,
//                             { backgroundColor: theme.colors.darkPurple },
//                         ]}>
//                         <Camera
//                             key={randomId}
//                             style={baseStyles.camera}
//                             type={CameraType.back}
//                             onCameraReady={() =>
//                                 setIsCameraReady(prev => !prev)
//                             }
//                             barCodeScannerSettings={{
//                                 barCodeTypes: [
//                                     BarCodeScanner.Constants.BarCodeType.qr,
//                                 ],
//                             }}
//                             onBarCodeScanned={confirmAddress}
//                             onMountError={error => console.log(error)}
//                             ratio={"16.9"}>
//                             {isCameraReady && (
//                                 <QrScannerLayout
//                                     color={theme.colors.darkPurpleRGBA}
//                                 />
//                             )}
//                             <CameraHeader onClose={onClose} />
//                         </Camera>
//                     </View>
//                 )}
//             </BaseModal>
//         )

//     return <></>
// }

// const baseStyles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: "center",
//         width: deviceWidth,
//     },
//     camera: {
//         flex: 1,
//     },
// })
