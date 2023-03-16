import { useNavigation, useTheme } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useState } from "react"

import { SafeAreaView, StyleSheet, ViewToken } from "react-native"
import { useBottomSheetModal } from "~Common"
import { useDevicesList } from "~Common/Hooks/Entities"
import { BaseIcon, BaseSpacer, BaseView } from "~Components"
import { Device } from "~Storage"
import {
    DeviceBox,
    WalletManagementBottomSheet,
    WalletManagementHeader,
} from "./components"

export const WalletManagementScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()

    const [isScrollable, setIsScrollable] = useState(false)
    const devices = useDevicesList()
    const [selectedDevice, setSelectedDevice] = useState<Device>()

    const {
        ref: walletManagementBottomSheetRef,
        onOpen: openWalletManagementSheet,
        onClose: closeWalletManagementSheet,
    } = useBottomSheetModal()

    const goBack = useCallback(() => nav.goBack(), [nav])

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
            if (viewableItems.length < devices.length) {
                setIsScrollable(true)
            } else {
                setIsScrollable(false)
            }
        },
        [devices.length],
    )

    return (
        <>
            <SafeAreaView />
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />
            <BaseSpacer height={20} />

            <BaseView px={20} style={{ height: "100%" }}>
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
                    estimatedItemSize={152} // erik this one is item width not list length
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
        </>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: { paddingHorizontal: 20, alignSelf: "flex-start" },
})
