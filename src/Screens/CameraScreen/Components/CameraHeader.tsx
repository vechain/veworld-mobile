import React from "react"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { isIOS } from "~Common/Utils/PlatformUtils/Platform"

export const CameraHeader = ({ onClose }: { onClose: () => void }) => {
    const { LL } = useI18nContext()

    return (
        <BaseView
            flexDirection="row"
            style={baseStyles.container}
            justifyContent="center"
            w={100}
            alignItems="center">
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
        marginTop: isIOS() ? 60 : 20,
    },
    icon: {
        position: "absolute",
        left: isIOS() ? 20 : 8,
    },
})
