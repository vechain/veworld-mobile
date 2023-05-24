import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useState } from "react"

import { ViewToken, StyleSheet } from "react-native"
import { useBottomSheetModal } from "~Common"
import {
    BackButtonHeader,
    BaseSpacer,
    BaseView,
    BaseSafeArea,
    DeviceBox,
} from "~Components"
import { BaseDevice } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import { AccountMgmtBottomSheet, WalletManagementHeader } from "./components"

export const WalletManagementScreen = () => {
    const [isScrollable, setIsScrollable] = useState(false)

    const devices = useAppSelector(selectDevices())
    const [selectedDevice, setSelectedDevice] = useState<BaseDevice>()

    const {
        ref: accountMgmtBottomSheetRef,
        onOpen: openAccountMgmtSheet,
        onClose: closeAccountMgmtSheet,
    } = useBottomSheetModal()

    const devicesListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const onDeviceSelected = useCallback(
        (device: BaseDevice) => () => {
            setSelectedDevice(device)
            openAccountMgmtSheet()
        },
        [openAccountMgmtSheet, setSelectedDevice],
    )

    const checkViewableItems = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            setIsScrollable(viewableItems.length < devices.length)
        },
        [devices.length],
    )

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView px={20} style={styles.view}>
                <FlashList
                    data={devices}
                    scrollEnabled={isScrollable}
                    onViewableItemsChanged={checkViewableItems}
                    keyExtractor={device => device.rootAddress}
                    ListHeaderComponent={
                        <>
                            <WalletManagementHeader />
                            <BaseSpacer height={24} />
                        </>
                    }
                    ItemSeparatorComponent={devicesListSeparator}
                    // contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => {
                        return (
                            <DeviceBox
                                device={item}
                                onDeviceSelected={onDeviceSelected(item)}
                            />
                        )
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={152}
                    estimatedListSize={{
                        height: 184,
                        width: 152 * devices.length + (devices.length - 1) * 16,
                    }}
                />

                <AccountMgmtBottomSheet
                    ref={accountMgmtBottomSheetRef}
                    onClose={closeAccountMgmtSheet}
                    device={selectedDevice}
                />
            </BaseView>
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    view: { height: "100%", width: "100%" },
})
