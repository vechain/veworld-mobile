import React from "react"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"

export const CameraHeader = ({ onClose }: { onClose: () => void }) => {
    const { LL } = useI18nContext()

    return (
        <BaseView
            orientation="row"
            style={baseStyles.container}
            justify="center"
            w={100}
            align="center">
            <BaseIcon
                name={"chevron-left"}
                color={"white"}
                size={36}
                action={onClose}
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
        zIndex: 3,
        marginTop: 60,
    },
    icon: {
        position: "absolute",
        left: 20,
    },
})
