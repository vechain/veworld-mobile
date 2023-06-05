import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { ColorThemeType, useThemedStyles } from "~Common"
import { AddressUtils } from "~Utils"
import {
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    LedgerBadge,
} from "~Components"
import { BaseDevice, DEVICE_TYPE } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"

type Props = {
    selectedDevice?: BaseDevice
    onDevicePress: (device: BaseDevice) => void
    inBottomSheet?: boolean
}
export const DevicesList: React.FC<Props> = ({
    selectedDevice,
    onDevicePress,
}) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const devices = useAppSelector(selectDevices)

    const handleOnDevicePress = useCallback(
        (device: BaseDevice) => () => {
            onDevicePress(device)
        },
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
                <BaseTouchableBox
                    key={item.rootAddress}
                    innerContainerStyle={style}
                    action={handleOnDevicePress(item)}>
                    <BaseView flexDirection="row">
                        {item.type === DEVICE_TYPE.LEDGER && <LedgerBadge />}
                        <BaseText pl={8} typographyFont="subSubTitle">
                            {item.alias}
                        </BaseText>
                    </BaseView>
                </BaseTouchableBox>
            )
        },
        [themedStyles, handleOnDevicePress, selectedDevice],
    )

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

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
