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
import { useI18nContext } from "~i18n"
import { StringUtils } from "~Utils"
import { ReceiveTab } from "./ReceiveTab"
import { ScanTab } from "./ScanTab"

const TABS = ["scan", "receive"] as const

export const SendReceiveBottomSheet = forwardRef<BottomSheetModalMethods, {}>(function SendReceiveBottomSheet(
    props,
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

    const cameraBounds = useDerivedValue(
        () => ({ x: cameraX.value + rootX.value, y: cameraY.value + rootY.value }),
        [rootX.value, rootY.value, cameraX.value, cameraY.value],
    )

    const points = useSharedValue([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
    ])

    const children = useMemo(() => {
        return (
            <>
                <BaseView py={24} px={16} justifyContent="center" flexDirection="row" position="relative">
                    <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.WHITE}>
                        {LL[`QR_CODE_${StringUtils.toUppercase(tab)}_TITLE`]()}
                    </BaseText>
                    <BaseView style={styles.closeIconContainer}>
                        <TouchableOpacity style={[styles.iconContainer]} onPress={onClose}>
                            <BaseIcon name="icon-x" color={COLORS.WHITE} size={20} />
                        </TouchableOpacity>
                    </BaseView>
                </BaseView>
                <BaseText typographyFont="captionMedium" color={COLORS.WHITE} align="center">
                    {LL[`QR_CODE_${StringUtils.toUppercase(tab)}_DESCRIPTION`]()}
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
    ])

    const device = useCameraDevice("back")

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned: codes => {
            for (const code of codes) {
                if (!code.frame) return
                const n = [
                    {
                        x: code.frame!.x - code.frame!.width / 2,
                        y: code.frame!.y + code.frame!.height / 5,
                    },
                    {
                        x: code.frame!.x + code.frame!.width,
                        y: code.frame!.y + code.frame!.height / 5,
                    },
                    {
                        x: code.frame!.x + code.frame!.width,
                        y: code.frame!.y + code.frame!.height * 1.5,
                    },
                    {
                        x: code.frame!.x - code.frame!.width / 2,
                        y: code.frame!.y + code.frame!.height * 1.5,
                    },
                ]
                points.value = [...n]

                const biggerRect = {
                    x: cameraBounds.value.x * 0.8,
                    y: cameraBounds.value.y * 0.8,
                    width: 200 + cameraBounds.value.x * 0.4,
                    height: 200 + cameraBounds.value.y * 0.4,
                }

                //Outside of detection area
                if (
                    !n.every(point => {
                        return (
                            point.x >= biggerRect.x &&
                            point.x <= biggerRect.x + biggerRect.width &&
                            point.y >= biggerRect.y &&
                            point.y <= biggerRect.y + biggerRect.height
                        )
                    })
                ) {
                    return
                }
            }
        },
    })

    const skiaClip = useDerivedValue(() =>
        Skia.RRectXY(Skia.XYWHRect(rootX.value + cameraX.value, rootY.value + cameraY.value, 200, 200), 16, 16),
    )

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
