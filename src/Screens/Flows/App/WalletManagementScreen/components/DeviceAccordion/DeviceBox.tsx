import React from "react"
import { useTheme } from "~Common"

import { BaseIcon, BaseText, BaseTouchableBox } from "~Components"
import { Device } from "~Model"

type Props = {
    device: Device
    onDeviceClick: () => void
}

export const DeviceBox: React.FC<Props> = ({ device, onDeviceClick }) => {
    const theme = useTheme()

    return (
        <BaseTouchableBox action={onDeviceClick} justifyContent="space-between">
            <BaseText typographyFont="subTitleBold">{device.alias}</BaseText>
            <BaseIcon
                name={"pencil-outline"}
                color={theme.colors.text}
                size={24}
            />
        </BaseTouchableBox>
    )
}
