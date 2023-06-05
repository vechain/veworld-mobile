import React from "react"
import { BaseText, BaseView } from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import PlatformUtils from "~Utils/PlatformUtils" // TODO: remove this circular dependency

export const CameraHeader = () => {
    const { LL } = useI18nContext()

    return (
        <BaseView
            flexDirection="row"
            style={baseStyles.container}
            justifyContent="center"
            w={100}
            alignItems="center">
            <BaseText typographyFont="subTitle" color="white">
                {LL.TITLE_SCAN_QRCODE()}
            </BaseText>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    container: {
        marginTop: PlatformUtils.isIOS() ? 60 : 20,
    },
    icon: {
        position: "absolute",
        left: PlatformUtils.isIOS() ? 20 : 8,
    },
})
