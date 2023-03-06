import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { ColorThemeType, useThemedStyles } from "~Common"
import { compareAddresses } from "~Common/Utils/AddressUtils/AddressUtils"
import { BaseSpacer, BaseText, BaseTouchableBox } from "~Components"
import { Device, useListListener, useRealm } from "~Storage"

type Props = {
    selectedDevice?: Device
    onDevicePress: (device: Device) => void
    inBottomSheet?: boolean
}
export const DevicesList: React.FC<Props> = ({
    selectedDevice,
    onDevicePress,
    inBottomSheet = false,
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
    const renderItem = useCallback(
        ({ item }: { item: Device }) => {
            const isSelected = compareAddresses(
                item.rootAddress,
                selectedDevice?.rootAddress,
            )
            const style = isSelected
                ? themedStyles.selected
                : themedStyles.notSelected
            return (
                <BaseTouchableBox
                    key={item.rootAddress}
                    style={style}
                    action={handleOnDevicePress(item)}>
                    <BaseText typographyFont="subTitle">{item.alias}</BaseText>
                </BaseTouchableBox>
            )
        },
        [themedStyles, handleOnDevicePress, selectedDevice],
    )

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    if (inBottomSheet)
        return (
            <BottomSheetFlatList
                // style={themedStyles.container}
                contentContainerStyle={themedStyles.container}
                data={devices}
                // numColumns={1}
                renderItem={renderItem}
                // showsVerticalScrollIndicator={false}
                // ItemSeparatorComponent={renderSeparator}
                keyExtractor={item => item.rootAddress}
            />
        )

    return (
        <FlatList
            style={themedStyles.container}
            data={devices}
            numColumns={1}
            horizontal={false}
            renderItem={renderItem}
            nestedScrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={renderSeparator}
            keyExtractor={item => item.rootAddress}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            backgroundColor: "white ",
        },
        selected: {
            borderWidth: 1.5,
            borderColor: theme.colors.text,
        },
        notSelected: {
            borderWidth: 1.5,
            borderColor: theme.colors.card,
        },
    })
