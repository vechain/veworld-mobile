import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, useThemedStyles } from "~Common"
import { compareAddresses } from "~Common/Utils/AddressUtils/AddressUtils"
import { BaseText, BaseTouchableBox } from "~Components"
import { Device, useListListener, useRealm } from "~Storage"

type Props = {
    selectedDevice?: Device
    onDevicePress: (device: Device) => void
}
export const DevicesList: React.FC<Props> = ({
    selectedDevice,
    onDevicePress,
}) => {
    const { store } = useRealm()
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const devices = useListListener(Device.getName(), store) as Device[]

    const handleOnDevicePress = useCallback(
        (device: Device) => () => {
            onDevicePress(device)
        },
        [onDevicePress],
    )
    return (
        <>
            {devices.map(device => {
                const isSelected = compareAddresses(
                    device.rootAddress,
                    selectedDevice?.rootAddress,
                )
                const style = isSelected
                    ? themedStyles.selected
                    : themedStyles.notSelected
                return (
                    <BaseTouchableBox
                        style={style}
                        action={handleOnDevicePress(device)}>
                        <BaseText typographyFont="subTitle">
                            {device.alias}
                        </BaseText>
                    </BaseTouchableBox>
                )
            })}
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        selected: {
            borderWidth: 1.5,
            borderColor: theme.colors.text,
        },
        notSelected: {},
    })
