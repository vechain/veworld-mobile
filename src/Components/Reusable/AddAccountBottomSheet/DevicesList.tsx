import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { FlatListScrollPropsType, useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { AddressUtils } from "~Utils"
import {
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    LedgerBadge,
} from "~Components"
import { BaseDevice, DEVICE_TYPE } from "~Model"
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
            // TODO: use Device Box here (https://github.com/vechainfoundation/veworld-mobile/issues/1299)
            return (
                <BaseTouchableBox
                    haptics="Light"
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
        },
        notSelected: {
            borderWidth: 1.5,
            borderColor: theme.colors.card,
        },
    })
