import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { FlatListScrollPropsType, useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { AddressUtils } from "~Utils"
import { BaseSpacer, DeviceBox } from "~Components"
import { BaseDevice } from "~Model"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"

type Props = {
    selectedDevice?: BaseDevice
    onDevicePress: (device: BaseDevice) => void
    inBottomSheet?: boolean
    devices: BaseDevice[]
    flatListScrollProps: FlatListScrollPropsType
}
export const DevicesList: React.FC<Props> = ({
    selectedDevice,
    onDevicePress,
    devices,
    flatListScrollProps,
}) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)

    const handleOnDevicePress = useCallback(
        (device: BaseDevice) => () => onDevicePress(device),
        [onDevicePress],
    )
    const renderItem = useCallback(
        ({ item }: { item: BaseDevice }) => {
            const isSelected = AddressUtils.compareAddresses(
                item.rootAddress,
                selectedDevice?.rootAddress,
            )
            const style = isSelected
                ? themedStyles.selected
                : themedStyles.notSelected
            return (
                <DeviceBox
                    isIconVisible={false}
                    onDeviceSelected={handleOnDevicePress}
                    device={item}
                    cardStyle={style}
                />
            )
        },
        [themedStyles, handleOnDevicePress, selectedDevice],
    )

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    return (
        <BottomSheetFlatList
            style={themedStyles.container}
            data={devices}
            numColumns={1}
            horizontal={false}
            renderItem={renderItem}
            nestedScrollEnabled={false}
            ItemSeparatorComponent={renderSeparator}
            keyExtractor={item => item.rootAddress}
            contentContainerStyle={themedStyles.contentContainer}
            {...flatListScrollProps}
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            backgroundColor: "white ",
        },
        contentContainer: {
            paddingBottom: 24,
        },
        selected: {
            borderWidth: 1.5,
            borderColor: theme.colors.text,
            borderRadius: 16,
        },
        notSelected: {
            borderWidth: 1.5,
            borderColor: theme.colors.card,
            borderRadius: 16,
        },
    })
