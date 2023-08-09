import { FlashList, ListRenderItem } from "@shopify/flash-list"
import React, { useCallback, useRef, useState } from "react"

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
    RequireUserPassword,
    SwipeableRow,
} from "~Components"
import { Device } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import {
    RemoveWalletWarningBottomSheet,
    useWalletDeletion,
    WalletManagementHeader,
    WalletMgmtBottomSheet,
} from "./components"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"

export const WalletManagementScreen = () => {
    const devices = useAppSelector(selectDevices)
    const [selectedDevice, setSelectedDevice] = useState<Device>()

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(devices, 1, 2) // 1 and 2 are to simulate snapIndex fully expanded.

    const { deleteWallet } = useWalletDeletion(selectedDevice)

    const {
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        checkIdentityBeforeOpening,
    } = useCheckIdentity({
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

    const onDeviceSelected = useCallback(
        (device: Device) => () => {
            setSelectedDevice(device)
            openAccountMgmtSheet()
        },
        [openAccountMgmtSheet, setSelectedDevice],
    )

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(
        new Map(),
    )
    const renderItem: ListRenderItem<Device> = useCallback(
        ({ item, index }) => {
            return (
                <SwipeableRow
                    item={item}
                    index={index}
                    itemKey={String(index)}
                    swipeableItemRefs={swipeableItemRefs}
                    onOpenDeleteItemBottomSheet={openRemoveWalletBottomSheet}
                    setSelectedItem={setSelectedDevice}>
                    <DeviceBox
                        device={item}
                        onDeviceSelected={onDeviceSelected(item)}
                    />
                </SwipeableRow>
            )
        },
        [onDeviceSelected, openRemoveWalletBottomSheet],
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
                <BaseView style={styles.view}>
                    <FlashList
                        data={devices}
                        scrollEnabled={isListScrollable}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        keyExtractor={device => device.rootAddress}
                        ListHeaderComponent={<BaseSpacer height={16} />}
                        renderItem={renderItem}
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

                    <RemoveWalletWarningBottomSheet
                        onConfirm={checkIdentityBeforeOpening}
                        onClose={closeRemoveWalletBottomSheet}
                        ref={removeWalletBottomSheetRef}
                    />

                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen}
                        onClose={handleClosePasswordModal}
                        onSuccess={onPasswordSuccess}
                    />
                </BaseView>
            }
        />
    )
}

const styles = StyleSheet.create({
    view: { top: 0, flex: 1, marginBottom: 0 },
})
