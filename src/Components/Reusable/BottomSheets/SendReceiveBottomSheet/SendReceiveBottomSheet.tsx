import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Canvas, Circle, Fill, Path, Points, Rect, RoundedRect, Skia, vec } from "@shopify/react-native-skia"
import { Camera } from "expo-camera"
import React, { forwardRef, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    LayoutChangeEvent,
    PixelRatio,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native"
import Animated, { runOnJS, useDerivedValue, useSharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Code, DrawableFrame, Camera as RNVCamera, useCameraDevice, useCodeScanner } from "react-native-vision-camera"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { WalletConnectIcon } from "~Components/Reusable/WalletConnectIconSvg"
import { COLORS, SCREEN_HEIGHT, SCREEN_WIDTH } from "~Constants"
import { useAppState, useBottomSheetModal, useCameraPermissions, useThemedStyles } from "~Hooks"
import { useQrScanDetection } from "~Hooks/useQrScanDetection"
import { useI18nContext } from "~i18n"
import { PlatformUtils, StringUtils } from "~Utils"
import { ReceiveTab } from "./ReceiveTab"
import { ScanTab } from "./ScanTab"

const SEND_RECEIVE_BS_TABS = ["scan", "receive"] as const
export type SendReceiveBsTab = (typeof SEND_RECEIVE_BS_TABS)[number]

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
    /**
     * Boolean to indicate if it has a WC target.
     * @default false
     */
    hasWCTarget?: boolean
}

export type SendReceiveBottomSheetOpenProps<TTabs extends SendReceiveBsTab[] | readonly SendReceiveBsTab[]> = {
    tabs: TTabs
    defaultTab: TTabs[number]
}

const SendReceiveBottomSheetContent = <TTabs extends SendReceiveBsTab[] | readonly SendReceiveBsTab[]>({
    tabs,
    defaultTab,
    title,
    description,
    onScan,
    onClose,
    hasWCTarget,
}: Props &
    SendReceiveBottomSheetOpenProps<TTabs> & {
        onClose: () => void
    }) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const [selectedTab, setSelectedTab] = useState<TTabs[number]>(defaultTab)
    const [hasCameraPerms, setCameraPerms] = useState(false)
    const { currentState } = useAppState()
    const inset = useSafeAreaInsets()

    const rootX = useSharedValue(0)
    const rootY = useSharedValue(0)
    const cameraX = useSharedValue(0)
    const cameraY = useSharedValue(0)

    const labels = useMemo(() => {
        return tabs.map(tab => LL[`SEND_RECEIVE_TAB_${StringUtils.toUppercase(tab)}`]())
    }, [LL, tabs])

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
            "worklet"
            rootX.value = e.nativeEvent.layout.x
            rootY.value = e.nativeEvent.layout.y
        },
        [rootX, rootY],
    )

    const onScanCameraLayout = useCallback(
        (e: LayoutChangeEvent) => {
            "worklet"
            cameraX.value = e.nativeEvent.layout.x
            cameraY.value = e.nativeEvent.layout.y
        },
        [cameraX, cameraY],
    )

    const children = useMemo(() => {
        return (
            <BaseView flex={1} pt={PlatformUtils.isIOS() ? inset.top : 0}>
                <BaseView flexDirection="column" gap={16} pt={16} px={16} position="relative">
                    <BaseView justifyContent="space-between" flexDirection="row" alignItems="center">
                        {/* This is an hidden element, used to simply put the title right in the middle */}
                        <BaseView style={[styles.iconContainer, styles.hiddenElement]}>
                            <BaseIcon name="icon-x" color={COLORS.WHITE} size={20} />
                        </BaseView>
                        <Text style={styles.title}>
                            {title ?? LL[`QR_CODE_${StringUtils.toUppercase(selectedTab)}_TITLE`]()}
                        </Text>
                        <TouchableOpacity style={[styles.iconContainer]} onPress={onClose}>
                            <BaseIcon name="icon-x" color={COLORS.WHITE} size={20} />
                        </TouchableOpacity>
                    </BaseView>
                    <BaseText typographyFont="captionMedium" color={COLORS.WHITE} align="center">
                        {description ?? LL[`QR_CODE_${StringUtils.toUppercase(selectedTab)}_DESCRIPTION`]()}
                    </BaseText>
                    {hasWCTarget && (
                        <View style={styles.walletConnectWrapper}>
                            <BaseView
                                flexDirection="row"
                                gap={12}
                                borderRadius={99}
                                py={2}
                                px={8}
                                mt={24}
                                bg={COLORS.BALANCE_BACKGROUND_95}>
                                <WalletConnectIcon color={COLORS.WHITE} />
                                <BaseText typographyFont="captionMedium" color={COLORS.WHITE}>
                                    {LL.WALLET_CONNECT_SUPPORTED()}
                                </BaseText>
                            </BaseView>
                        </View>
                    )}
                </BaseView>
                {selectedTab === "receive" ? (
                    <ReceiveTab />
                ) : (
                    <ScanTab
                        onPermissionPress={handleCheckPermissions}
                        hasCameraPerms={hasCameraPerms}
                        onRootLayout={onScanRootLayout}
                        onCameraWrapperLayout={onScanCameraLayout}
                    />
                )}
                {tabs.length > 1 && (
                    <BaseTabs
                        keys={tabs}
                        selectedKey={selectedTab}
                        setSelectedKey={setSelectedTab}
                        labels={labels}
                        rootStyle={styles.tabElement}
                        indicatorBackgroundColor="rgba(255, 255, 255, 0.15)"
                        containerBackgroundColor={COLORS.PURPLE_DISABLED}
                        selectedTextColor={COLORS.WHITE}
                        unselectedTextColor={COLORS.WHITE}
                    />
                )}

                <BaseSpacer height={64} />
            </BaseView>
        )
    }, [
        inset.top,
        styles.iconContainer,
        styles.hiddenElement,
        styles.title,
        styles.walletConnectWrapper,
        styles.tabElement,
        title,
        LL,
        selectedTab,
        onClose,
        description,
        hasWCTarget,
        handleCheckPermissions,
        hasCameraPerms,
        onScanRootLayout,
        onScanCameraLayout,
        tabs,
        labels,
    ])

    const pR = useSharedValue(PixelRatio.get())

    const device = useCameraDevice("back")
    const offsetX = useDerivedValue(() => rootX.value + cameraX.value, [rootX.value, cameraX.value])
    const offsetY = useDerivedValue(() => rootY.value + cameraY.value, [rootY.value, cameraY.value])
    const handleScan = useCallback(
        async (data: string) => {
            // const result = await onScan(data)
            // if (result) onClose()
        },
        [onClose, onScan],
    )

    const insets = useSafeAreaInsets()

    const points = useSharedValue<{ d: string }[]>([])

    const [codes, setCodes] = useState<Code[]>([])
    const [frame, setFrame] = useState<DrawableFrame>(null!)

    const sharedCodes = useSharedValue<Code[]>([])
    const sharedFrame = useSharedValue<DrawableFrame>(undefined!)

    const onCodeScanned = useQrScanDetection({
        offsetX,
        offsetY,
        size: 200,
        onScan: handleScan,
        points,
        codes: sharedCodes,
        frame: sharedFrame,
        setCodes,
        setFrame,
    })

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned,
    })

    const skiaClip = useDerivedValue(() => {
        if (offsetX.value === 0 || offsetY.value === 0)
            return Skia.RRectXY(Skia.XYWHRect(offsetX.value, offsetY.value, 0, 0), 16, 16)
        return Skia.RRectXY(Skia.XYWHRect(offsetX.value, offsetY.value, 200, 200), 16, 16)
    })

    const derivedCodeFrame = useDerivedValue(() => {
        const frames: { x: string; y: string }[] = sharedCodes.value.map(code => {
            if (code.frame === undefined) return { x: "0%", y: "0%" }
            return {
                x:
                    (parseFloat(
                        `${100 - ((code.frame.y + code.frame.width / 2) / sharedFrame.value?.height || 0) * 100}`,
                    ) /
                        100) *
                        SCREEN_WIDTH -
                    100,
                y:
                    (parseFloat(`${((code.frame.x + code.frame.height / 2) / (sharedFrame.value?.width || 0)) * 100}`) /
                        100) *
                        (SCREEN_HEIGHT - insets.bottom) -
                    100,
            }
            // return {
            //     x: 100 - ((code.frame.y + code.frame.width / 2) / sharedFrame.value.height) * SCREEN_HEIGHT + 100,
            //     y: ((code.frame.x + code.frame.height / 2) / sharedFrame.value.width) * SCREEN_WIDTH + 100,
            // }
        })
        console.log("frames", frames)
        return frames
    }, [sharedCodes.value, sharedFrame.value, insets.bottom])

    const pointsV = useDerivedValue(() => {
        console.log("points", points.value)
        console.log("W", SCREEN_WIDTH)
        console.log("H", SCREEN_HEIGHT)

        return points.value.map(p => p.d)
        // return points.value.map(p => vec(p.x / 2, p.y / 2))
        // return [vec(100, 100), vec(150, 100), vec(150, 150), vec(100, 150)]
    })

    return selectedTab === "scan" && hasCameraPerms ? (
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

            {derivedCodeFrame.value.map((code, index) => {
                // if (code.frame === undefined) return <></>
                return (
                    <Animated.View
                        key={"scanner-focus-no" + index}
                        style={{
                            left: code.x,
                            top: code.y,
                            position: "absolute",
                            color: COLORS.GREEN_600,
                            borderWidth: 1,
                            borderColor: "red",
                            width: 200,
                            height: 200,
                            borderRadius: 16,
                        }}
                    />
                )
            })}
            <BaseView style={[StyleSheet.absoluteFill, styles.cameraChildren]}>{children}</BaseView>
        </BaseView>
    ) : (
        children
    )
}

export const SendReceiveBottomSheet = forwardRef<BottomSheetModalMethods, Props>(function SendReceiveBottomSheet(
    { onScan, title, description, hasWCTarget },
    ref,
) {
    const { styles } = useThemedStyles(baseStyles)
    const { onClose } = useBottomSheetModal({ externalRef: ref as RefObject<BottomSheetModalMethods> })

    return (
        <BaseBottomSheet<SendReceiveBottomSheetOpenProps<typeof SEND_RECEIVE_BS_TABS>>
            snapPoints={["100%"]}
            noMargins
            ref={ref}
            backgroundStyle={styles.rootBg}
            enablePanDownToClose={false}
            rounded={false}>
            {data => (
                <SendReceiveBottomSheetContent
                    defaultTab={data.defaultTab}
                    onClose={onClose}
                    tabs={data.tabs}
                    onScan={onScan}
                    title={title}
                    description={description}
                    hasWCTarget={hasWCTarget}
                />
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
        title: {
            verticalAlign: "middle",
            alignSelf: "center",
            color: COLORS.WHITE,
            fontSize: 16,
            fontWeight: "600",
            lineHeight: 24,
            textAlign: "center",
        },
        hiddenElement: {
            opacity: 0,
            pointerEvents: "none",
        },
        walletConnectWrapper: {
            top: "100%",
            left: 16,
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
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
