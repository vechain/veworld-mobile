import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Camera, CameraView } from "expo-camera"
import React, { forwardRef, RefObject, useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { BlurView } from "~Components/Reusable/BlurView"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useCameraPermissions, useDisclosure, useThemedStyles } from "~Hooks"
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
    const { onOpen: onCameraReady } = useDisclosure(false)

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
                    <ScanTab onPermissionPress={handleCheckPermissions} hasCameraPerms={hasCameraPerms} />
                )}
                <BaseTabs
                    keys={TABS}
                    selectedKey={tab}
                    setSelectedKey={setTab}
                    labels={labels}
                    rootStyle={styles.tabElement}
                    indicatorBackgroundColor="rgba(255, 255, 255, 0.15)"
                    containerBackgroundColor="rgba(0, 0, 0, 0.30)"
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
        styles.closeIconContainer,
        styles.iconContainer,
        styles.tabElement,
        tab,
    ])

    return (
        <BaseBottomSheet
            snapPoints={["100%"]}
            noMargins
            ref={ref}
            backgroundStyle={styles.rootBg}
            enablePanDownToClose={false}
            rounded={false}>
            {tab === "scan" && hasCameraPerms ? (
                <CameraView
                    ratio="16:9"
                    onCameraReady={onCameraReady}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    style={styles.cameraView}>
                    {children}
                    <BlurView blurAmount={25} overlayColor="transparent" style={styles.blurView} />
                </CameraView>
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
    })
