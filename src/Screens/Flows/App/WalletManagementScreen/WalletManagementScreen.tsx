import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useState } from "react"

import { StyleSheet } from "react-native"
import { useBottomSheetModal, useScrollableList } from "~Hooks"
import {
    BaseSpacer,
    BaseView,
    DeviceBox,
    RenameWalletBottomSheet,
    Layout,
} from "~Components"
import { BaseDevice, RENAME_WALLET_TYPE } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import { AccountMgmtBottomSheet, WalletManagementHeader } from "./components"

export const WalletManagementScreen = () => {
    const devices = useAppSelector(selectDevices)
    const [selectedDevice, setSelectedDevice] = useState<BaseDevice>()

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(devices, 1, 2) // 1 and 2 are to simulate snapIndex fully expanded.

    const {
        ref: accountMgmtBottomSheetRef,
        onOpen: openAccountMgmtSheet,
        onClose: closeAccountMgmtSheet,
    } = useBottomSheetModal()

    const {
        ref: renameAccountBottomSheetRef,
        onOpen: openRenameAccountBottomSheet,
        onClose: closeRenameAccountBottonSheet,
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

    return (
        <Layout
            safeAreaTestID="Wallet_Management_Screen"
            fixedHeader={
                <>
                    <WalletManagementHeader />
                    <BaseSpacer height={16} />
                </>
            }
            bodyWithoutScrollView={
                <BaseView style={styles.view} mx={20}>
                    <FlashList
                        data={devices}
                        scrollEnabled={isListScrollable}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        keyExtractor={device => device.rootAddress}
                        ItemSeparatorComponent={devicesListSeparator}
                        ListHeaderComponent={<BaseSpacer height={16} />}
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
                            width:
                                152 * devices.length +
                                (devices.length - 1) * 16,
                        }}
                        ListFooterComponent={<BaseSpacer height={16} />}
                    />
                    <AccountMgmtBottomSheet
                        ref={accountMgmtBottomSheetRef}
                        onClose={closeAccountMgmtSheet}
                        device={selectedDevice}
                        openRenameAccountBottomSheet={
                            openRenameAccountBottomSheet
                        }
                    />

                    <RenameWalletBottomSheet
                        type={RENAME_WALLET_TYPE.DEVICE}
                        ref={renameAccountBottomSheetRef}
                        onClose={closeRenameAccountBottonSheet}
                    />
                </BaseView>
            }
        />
    )
}

const styles = StyleSheet.create({
    view: { top: 0, flex: 1, marginBottom: 0 },
})
