import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useState } from "react"

import { StyleSheet } from "react-native"
import {
    useBottomSheetModal,
    useCheckIdentity,
    useScrollableList,
} from "~Hooks"
import {
    BaseSpacer,
    BaseView,
    DeviceBox,
    Layout,
    RenameWalletBottomSheet,
} from "~Components"
import { Device } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import { WalletManagementHeader, WalletMgmtBottomSheet } from "./components"
import { useWalletDeletion } from "~Screens/Flows/App/WalletManagementScreen/components/hooks/useWalletDeletion"
import { RemoveWalletWarning } from "~Screens/Flows/App/WalletManagementScreen/components/RemoveWalletWarning"

export const WalletManagementScreen = () => {
    const devices = useAppSelector(selectDevices)
    const [selectedDevice, setSelectedDevice] = useState<Device>()

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(devices, 1, 2) // 1 and 2 are to simulate snapIndex fully expanded.

    const { deleteWallet } = useWalletDeletion(selectedDevice)

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: deleteWallet,
            allowAutoPassword: false,
        })

    const {
        ref: accountMgmtBottomSheetRef,
        onOpen: openAccountMgmtSheet,
        onClose: closeAccountMgmtSheet,
    } = useBottomSheetModal()

    const {
        ref: removeWalletBottomSheetRef,
        onOpen: openRemoveWalletBottomSheet,
        onClose: closeRemoveWalletBottomSheet,
    } = useBottomSheetModal()

    const {
        ref: renameAccountBottomSheetRef,
        onOpen: openRenameWalletBottomSheet,
        onClose: closeRenameWalletBottonSheet,
    } = useBottomSheetModal()

    const devicesListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const onDeviceSelected = useCallback(
        (device: Device) => () => {
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
                    <WalletMgmtBottomSheet
                        ref={accountMgmtBottomSheetRef}
                        onClose={closeAccountMgmtSheet}
                        device={selectedDevice}
                        openRenameWalletBottomSheet={
                            openRenameWalletBottomSheet
                        }
                        openRemoveWalletBottomSheet={
                            openRemoveWalletBottomSheet
                        }
                        canRemoveWallet={devices.length > 1}
                    />

                    {selectedDevice && (
                        <RenameWalletBottomSheet
                            ref={renameAccountBottomSheetRef}
                            device={selectedDevice}
                            onClose={closeRenameWalletBottonSheet}
                        />
                    )}

                    <RemoveWalletWarning
                        onConfirm={checkIdentityBeforeOpening}
                        onClose={closeRemoveWalletBottomSheet}
                        ref={removeWalletBottomSheetRef}
                    />

                    <ConfirmIdentityBottomSheet />
                </BaseView>
            }
        />
    )
}

const styles = StyleSheet.create({
    view: { top: 0, flex: 1, marginBottom: 0 },
})
