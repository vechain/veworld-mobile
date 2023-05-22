import React from "react"
import { useTheme } from "~Common"

import {
    BaseIcon,
    BaseText,
    BaseTouchableBox,
    BaseView,
    LedgerBadge,
} from "~Components"
import { BaseDevice, DEVICE_TYPE } from "~Model"

type Props = {
    device: BaseDevice
    onDeviceSelected: () => void
    isIconVisible?: boolean
}

export const DeviceBox: React.FC<Props> = ({
    device,
    onDeviceSelected,
    isIconVisible = true,
}) => {
    const theme = useTheme()

    return (
        <BaseTouchableBox
            action={onDeviceSelected}
            justifyContent="space-between">
            <BaseView flexDirection="row">
                {device.type === DEVICE_TYPE.LEDGER && <LedgerBadge />}
                <BaseText typographyFont="subTitleBold" pl={8}>
                    {device.alias}
                </BaseText>
            </BaseView>
            {isIconVisible && (
                <BaseIcon
                    name={"pencil-outline"}
                    color={theme.colors.text}
                    size={24}
                />
            )}
        </BaseTouchableBox>
    )
}
