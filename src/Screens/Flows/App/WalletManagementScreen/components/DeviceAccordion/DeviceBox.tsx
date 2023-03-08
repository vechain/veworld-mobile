import React from "react"
import { StyleSheet } from "react-native"

import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseIcon, BaseText, BaseTouchableBox } from "~Components"
import { Device } from "~Storage"

type Props = {
    device: Device
    onDeviceClick: () => void
}

export const DeviceBox: React.FC<Props> = ({ device, onDeviceClick }) => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseTouchableBox action={onDeviceClick} style={themedStyles.box}>
            <BaseText typographyFont="subTitle">{device.alias}</BaseText>
            <BaseIcon
                name={"pencil-outline"}
                color={theme.colors.text}
                size={24}
            />
        </BaseTouchableBox>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        box: {
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.colors.card,
        },
    })
