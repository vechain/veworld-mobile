import React, { useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { BaseIcon, BaseText, BaseTextInput, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType, ScanTarget } from "~Constants"
import { useCameraBottomSheet, useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import * as Clipboard from "expo-clipboard"

export const WalletAddressCard = () => {
    const [address, setAddress] = useState("")
    const { styles, theme } = useThemedStyles(baseStyles)

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        sourceScreen: Routes.SEND_TOKEN,
        targets: [ScanTarget.ADDRESS],
        onScanAddress: data => {
            setAddress(data)
            return Promise.resolve(true)
        },
    })

    const handlePasteAddress = useCallback(async () => {
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            let text = await Clipboard.getStringAsync()
            setAddress(text)
        }
    }, [])

    const handleClearAddress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        setAddress("")
    }, [setAddress])

    const handleOpenScanCamera = useCallback(() => {
        handleOpenCamera({ tabs: ["scan"], defaultTab: "scan" })
    }, [handleOpenCamera])

    const renderInputActions = useMemo(() => {
        if (address && address.length > 0) {
            return (
                <Pressable onPress={handleClearAddress}>
                    <BaseText numberOfLines={1}>{"Clear"}</BaseText>
                </Pressable>
            )
        }

        return (
            <Pressable onPress={handlePasteAddress}>
                <BaseText numberOfLines={1}>{"Paste"}</BaseText>
            </Pressable>
        )
    }, [address, handleClearAddress, handlePasteAddress])

    return (
        <>
            <BaseView style={styles.root}>
                <BaseText typographyFont="captionSemiBold" style={styles.title}>
                    {"Wallet address"}
                </BaseText>
                <BaseView style={styles.inputsContainer}>
                    <BaseTextInput
                        placeholder="Wallet or domain"
                        containerStyle={styles.input}
                        value={address}
                        setValue={setAddress}
                        // errorMessage="test"
                        rightIconAdornment
                        rightIcon={renderInputActions}
                    />
                    <TouchableOpacity style={styles.scanButton} activeOpacity={0.85} onPress={handleOpenScanCamera}>
                        <BaseIcon
                            name="icon-scan-line"
                            size={24}
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_100}
                        />
                    </TouchableOpacity>
                </BaseView>
            </BaseView>

            {RenderCameraModal}
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flexDirection: "column",
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE,
            borderRadius: 16,
            padding: 24,
            gap: 12,
        },
        title: {
            color: theme.isDark ? COLORS.GREY_100 : COLORS.GREY_100,
        },
        inputsContainer: {
            flexDirection: "row",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        input: {
            flex: 1,
            height: "auto",
        },
        scanButton: {
            borderRadius: 8,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
            borderWidth: 1,
            padding: 12,
            alignItems: "center",
            justifyContent: "center",
        },
    })
