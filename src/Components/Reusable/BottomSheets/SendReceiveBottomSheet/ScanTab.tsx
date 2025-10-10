import React from "react"
import { LayoutChangeEvent, StyleSheet, View } from "react-native"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

const ANCHOR_STYLES = {
    top_right: {
        transform: [{ rotateZ: "90deg" }],
        top: 0,
        right: 0,
    },
    top_left: {
        transform: [{ rotateZ: "0deg" }],
        top: 0,
        left: 0,
    },
    bottom_right: {
        transform: [{ rotateZ: "180deg" }],
        bottom: 0,
        right: 0,
    },
    bottom_left: {
        transform: [{ rotateZ: "270deg" }],
        bottom: 0,
        left: 0,
    },
}

const BorderElement = ({ anchor }: { anchor: keyof typeof ANCHOR_STYLES }) => {
    const { styles } = useThemedStyles(borderStyles)
    return <View style={[styles.root, ANCHOR_STYLES[anchor]]} />
}

const borderStyles = () =>
    StyleSheet.create({
        root: {
            borderTopLeftRadius: 16,
            borderColor: COLORS.WHITE_RGBA_50,
            borderLeftWidth: 2,
            borderTopWidth: 2,
            width: 40,
            height: 40,
            position: "absolute",
        },
    })

export const ScanTab = ({
    hasCameraPerms,
    onPermissionPress,
    onRootLayout,
    onCameraWrapperLayout,
}: {
    onPermissionPress: () => void | Promise<void>
    hasCameraPerms: boolean
    onRootLayout: (e: LayoutChangeEvent) => void
    onCameraWrapperLayout: (e: LayoutChangeEvent) => void
}) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView
            flex={1}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={24}
            onLayout={onRootLayout}>
            {hasCameraPerms ? (
                <BaseView
                    style={styles.cameraPermsDisabledContainer}
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    onLayout={onCameraWrapperLayout}>
                    <BorderElement anchor="top_left" />
                    <BorderElement anchor="top_right" />
                    <BorderElement anchor="bottom_right" />
                    <BorderElement anchor="bottom_left" />
                    <BaseText typographyFont="bodySemiBold" color={COLORS.WHITE}>
                        {LL.SCAN_QR_CODE()}
                    </BaseText>
                </BaseView>
            ) : (
                <>
                    <BaseView
                        style={styles.cameraPermsDisabledContainer}
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center">
                        <BorderElement anchor="top_left" />
                        <BorderElement anchor="top_right" />
                        <BorderElement anchor="bottom_right" />
                        <BorderElement anchor="bottom_left" />
                        <BaseIcon name="icon-camera-off" color={COLORS.WHITE} size={40} />
                    </BaseView>
                    <BaseText
                        typographyFont="captionMedium"
                        color={COLORS.BLUE_200}
                        align="center"
                        style={styles.cameraPermsText}>
                        {LL.QR_CODE_CAMERA_PERMS()}
                    </BaseText>
                    <BaseButton
                        px={12}
                        py={8}
                        rightIcon={<BaseIcon name="icon-settings" size={16} color={COLORS.WHITE} />}
                        action={onPermissionPress}
                        variant="outline"
                        style={styles.btnStyle}
                        textColor={COLORS.WHITE}>
                        {LL.QR_CODE_CAMERA_PERMS_CTA()}
                    </BaseButton>
                </>
            )}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        btnStyle: {
            backgroundColor: "transparent",
            borderRadius: 8,
            borderColor: COLORS.WHITE_RGBA_30,
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
        },
        cameraPermsDisabledContainer: { width: 200, height: 200, position: "relative" },
        cameraPermsText: { maxWidth: "50%" },
    })
