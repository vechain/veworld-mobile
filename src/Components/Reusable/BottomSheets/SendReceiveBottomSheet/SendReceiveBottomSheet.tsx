import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Canvas, Fill, Skia } from "@shopify/react-native-skia"
import { Camera } from "expo-camera"
import React, { forwardRef, RefObject, useCallback, useEffect, useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet, TouchableOpacity } from "react-native"
import { useDerivedValue, useSharedValue } from "react-native-reanimated"
import { Camera as RNVCamera, useCameraDevice, useCodeScanner } from "react-native-vision-camera"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { COLORS } from "~Constants"
import { useAppState, useBottomSheetModal, useCameraPermissions, useThemedStyles } from "~Hooks"
import { useQrScanDetection } from "~Hooks/useQrScanDetection"
import { useI18nContext } from "~i18n"
import { StringUtils } from "~Utils"
import { ReceiveTab } from "./ReceiveTab"
import { ScanTab } from "./ScanTab"

const TABS = ["scan", "receive"] as const

type Props = {
    onScan: (data: string) => Promise<boolean>
    /**
     * Title of the BS.
     * @default QR_CODE_<tab>_TITLE
     */
    title?: string
    /**
     * Title of the BS.
     * @default QR_CODE_<tab>_DESCRIPTION
     */
    description?: string
}

export const SendReceiveBottomSheet = forwardRef<BottomSheetModalMethods, Props>(function SendReceiveBottomSheet(
    { onScan, title, description },
    ref,
) {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const [tab, setTab] = useState<(typeof TABS)[number]>("receive")
    const { onClose } = useBottomSheetModal({ externalRef: ref as RefObject<BottomSheetModalMethods> })
    const [hasCameraPerms, setCameraPerms] = useState(false)
    const { currentState } = useAppState()

    const rootX = useSharedValue(0)
    const rootY = useSharedValue(0)
    const cameraX = useSharedValue(0)
    const cameraY = useSharedValue(0)

    const labels = useMemo(() => {
        return [LL.SEND_RECEIVE_TAB_SCAN(), LL.SEND_RECEIVE_TAB_RECEIVE()]
    }, [LL])

    const onCanceled = useCallback(() => {}, [])

    const { checkPermissions } = useCameraPermissions({ onCanceled })

    const handleCheckPermissions = useCallback(async () => {
        const res = await checkPermissions()
        setCameraPerms(res)
    }, [checkPermissions])

    useEffect(() => {
        Camera.getCameraPermissionsAsync().then(res => setCameraPerms(res.granted))
    }, [])

    const onScanRootLayout = useCallback(
        (e: LayoutChangeEvent) => {
            rootX.value = e.nativeEvent.layout.x
            rootY.value = e.nativeEvent.layout.y
        },
        [rootX, rootY],
    )

    const onScanCameraLayout = useCallback(
        (e: LayoutChangeEvent) => {
            cameraX.value = e.nativeEvent.layout.x
            cameraY.value = e.nativeEvent.layout.y
        },
        [cameraX, cameraY],
    )

    const children = useMemo(() => {
        return (
            <>
                <BaseView py={24} px={16} justifyContent="center" flexDirection="row" position="relative">
                    <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.WHITE}>
                        {title ?? LL[`QR_CODE_${StringUtils.toUppercase(tab)}_TITLE`]()}
                    </BaseText>
                    <BaseView style={styles.closeIconContainer}>
                        <TouchableOpacity style={[styles.iconContainer]} onPress={onClose}>
                            <BaseIcon name="icon-x" color={COLORS.WHITE} size={20} />
                        </TouchableOpacity>
                    </BaseView>
                </BaseView>
                <BaseText typographyFont="captionMedium" color={COLORS.WHITE} align="center">
                    {description ?? LL[`QR_CODE_${StringUtils.toUppercase(tab)}_DESCRIPTION`]()}
                </BaseText>
                {tab === "receive" ? (
                    <ReceiveTab />
                ) : (
                    <ScanTab
                        onPermissionPress={handleCheckPermissions}
                        hasCameraPerms={hasCameraPerms}
                        onRootLayout={onScanRootLayout}
                        onCameraWrapperLayout={onScanCameraLayout}
                    />
                )}
                <BaseTabs
                    keys={TABS}
                    selectedKey={tab}
                    setSelectedKey={setTab}
                    labels={labels}
                    rootStyle={styles.tabElement}
                    indicatorBackgroundColor="rgba(255, 255, 255, 0.15)"
                    containerBackgroundColor={COLORS.PURPLE_DISABLED}
                    selectedTextColor={COLORS.WHITE}
                    unselectedTextColor={COLORS.WHITE}
                />
                <BaseSpacer height={64} />
            </>
        )
    }, [
        LL,
        description,
        handleCheckPermissions,
        hasCameraPerms,
        labels,
        onClose,
        onScanCameraLayout,
        onScanRootLayout,
        styles.closeIconContainer,
        styles.iconContainer,
        styles.tabElement,
        tab,
        title,
    ])

    const device = useCameraDevice("back")
    const offsetX = useDerivedValue(() => rootX.value + cameraX.value, [rootX.value, cameraX.value])
    const offsetY = useDerivedValue(() => rootY.value + cameraY.value, [rootY.value, cameraY.value])
    const handleScan = useCallback(
        async (data: string) => {
            const result = await onScan(data)
            if (result) onClose()
        },
        [onClose, onScan],
    )

    const onCodeScanned = useQrScanDetection({ offsetX, offsetY, size: 200, onScan: handleScan })

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned,
    })

    const skiaClip = useDerivedValue(() => Skia.RRectXY(Skia.XYWHRect(offsetX.value, offsetY.value, 200, 200), 16, 16))

    return (
        <BaseBottomSheet
            snapPoints={["100%"]}
            noMargins
            ref={ref}
            backgroundStyle={styles.rootBg}
            enablePanDownToClose={false}
            rounded={false}>
            {tab === "scan" && hasCameraPerms ? (
                <BaseView flex={1} position="relative">
                    {device && (
                        <RNVCamera
                            style={styles.cameraView}
                            device={device}
                            isActive={currentState === "active"}
                            codeScanner={codeScanner}
                        />
                    )}

                    <Canvas style={StyleSheet.absoluteFill}>
                        <Fill color={COLORS.BALANCE_BACKGROUND_80} clip={skiaClip} invertClip />
                    </Canvas>
                    <BaseView style={[StyleSheet.absoluteFill, styles.cameraChildren]}>{children}</BaseView>
                </BaseView>
            ) : (
                children
            )}
        </BaseBottomSheet>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        rootBg: {
            backgroundColor: COLORS.BALANCE_BACKGROUND,
        },
        iconContainer: {
            padding: 10,
            backgroundColor: "rgba(0, 0, 0, 0.30)",
            borderRadius: 99,
        },
        closeIconContainer: {
            position: "absolute",
            top: 16,
            right: 16,
            flexDirection: "column",
            justifyContent: "center",
        },

        qrCodeWrapper: {
            width: 200,
            height: 200,
            borderRadius: 21.44,
            overflow: "hidden",
        },
        tabElement: {
            marginHorizontal: 24,
            alignSelf: "center",
            maxWidth: "75%",
            borderWidth: 0,
        },
        blurView: { height: "100%", width: "100%", position: "absolute", top: 0, left: 0 },
        cameraView: { flex: 1, position: "relative" },
        cameraChildren: { zIndex: 1 },
    })
