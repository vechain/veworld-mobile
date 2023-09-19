import React from "react"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import PlatformUtils from "~Utils/PlatformUtils"
import { COLORS } from "~Constants"

export const CameraHeader = ({ onClose }: { onClose: () => void }) => {
    const { LL } = useI18nContext()

    return (
        <BaseView
            flexDirection="row"
            style={baseStyles.container}
            alignItems="center"
            justifyContent="center"
            w={100}>
            <BaseIcon
                name="close"
                action={onClose}
                haptics="Light"
                color={COLORS.WHITE}
                style={baseStyles.icon}
            />

            <BaseText typographyFont="subTitle" color="white">
                {LL.TITLE_SCAN_QRCODE()}
            </BaseText>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        marginTop: PlatformUtils.isIOS() ? 60 : 20,
        top: 0,
        left: 0,
        position: "absolute",
    },
    icon: {
        position: "absolute",
        left: 24,
    },
})
