import React, { useCallback, useRef, useState } from "react"

import { Pressable, StyleSheet } from "react-native"
import { useBottomSheetModal, useCheckIdentity } from "~Hooks"
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
import DraggableFlatList, { RenderItem } from "react-native-draggable-flatlist"

export const WalletManagementScreen = () => {
    const devices = useAppSelector(selectDevices)
    const [selectedDevice, setSelectedDevice] = useState<Device>()
    const [isEdit, setIsEdit] = useState(false)

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
    const renderItem: RenderItem<Device> = useCallback(
        ({ item, getIndex, drag, isActive }) => {
            const index = getIndex() || 0
            return (
                <SwipeableRow
                    item={item}
                    index={index}
                    itemKey={String(index)}
                    swipeableItemRefs={swipeableItemRefs}
                    onOpenDeleteItemBottomSheet={openRemoveWalletBottomSheet}
                    setSelectedItem={setSelectedDevice}>
                    <Pressable
                        onPressIn={isEdit ? drag : undefined}
                        disabled={isActive}>
                        <DeviceBox
                            device={item}
                            onDeviceSelected={
                                isEdit ? undefined : onDeviceSelected(item)
                            }
                        />
                    </Pressable>
                </SwipeableRow>
            )
        },
        [isEdit, onDeviceSelected, openRemoveWalletBottomSheet],
    )

    return (
        <Layout
            safeAreaTestID="Wallet_Management_Screen"
            fixedHeader={
                <>
                    <WalletManagementHeader
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                    />
                    <BaseSpacer height={16} />
                </>
            }
            bodyWithoutScrollView={
                <BaseView style={styles.view}>
                    <DraggableFlatList
                        data={devices}
                        extraData={() => {}}
                        onDragEnd={() => {}}
                        keyExtractor={device => device.rootAddress}
                        renderItem={renderItem}
                        activationDistance={60}
                        showsVerticalScrollIndicator={false}
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
