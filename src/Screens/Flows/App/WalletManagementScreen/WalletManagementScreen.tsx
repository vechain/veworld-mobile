import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useState } from "react"

import { SafeAreaView, ViewToken } from "react-native"
import { useBottomSheetModal } from "~Common"
import { useDevicesList } from "~Common/Hooks/Entities"
import {
    BackButtonHeader,
    BaseSpacer,
    BaseView,
    BaseSafeArea,
} from "~Components"
import { Device } from "~Storage"
import {
    DeviceBox,
    WalletManagementBottomSheet,
    WalletManagementHeader,
} from "./components"

export const WalletManagementScreen = () => {
    const [isScrollable, setIsScrollable] = useState(false)
    const devices = useDevicesList()
    const [selectedDevice, setSelectedDevice] = useState<Device>()

    const {
        ref: walletManagementBottomSheetRef,
        onOpen: openWalletManagementSheet,
        onClose: closeWalletManagementSheet,
    } = useBottomSheetModal()

    const devicesListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const onDeviceClick = useCallback(
        (device: Device) => () => {
            setSelectedDevice(device)
            openWalletManagementSheet()
        },
        [openWalletManagementSheet, setSelectedDevice],
    )

    const checkViewableItems = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            setIsScrollable(viewableItems.length < devices.length)
        },
        [devices.length],
    )

    return (
        <BaseSafeArea grow={1}>
            <SafeAreaView />
            <BackButtonHeader />

            <BaseView px={20} style={{ height: "100%", width: "100%" }}>
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
                                onDeviceClick={onDeviceClick(item)}
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

                <WalletManagementBottomSheet
                    ref={walletManagementBottomSheetRef}
                    onClose={closeWalletManagementSheet}
                    device={selectedDevice}
                />
            </BaseView>
        </BaseSafeArea>
    )
}
