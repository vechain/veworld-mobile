import React, { useCallback, useRef, useState } from "react"
import {
    AddAccountBottomSheet,
    BaseView,
    DeviceBox,
    Layout,
    RequireUserPassword,
    SwipeableRow,
} from "~Components"
import { Device } from "~Model"
import { setDeviceState, useAppSelector } from "~Storage/Redux"
import { selectDevices } from "~Storage/Redux/Selectors"
import {
    CreateWalletOrAccountBottomSheet,
    RemoveWalletWarningBottomSheet,
    useWalletDeletion,
    WalletManagementHeader,
    WalletMgmtBottomSheet,
} from "./components"
import { StyleSheet } from "react-native"
import { useBottomSheetModal, useCheckIdentity } from "~Hooks"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import DraggableFlatList, { RenderItem } from "react-native-draggable-flatlist"
import { useNavigation } from "@react-navigation/native"
import { useDispatch } from "react-redux"

export const WalletManagementScreen = () => {
    const devices = useAppSelector(selectDevices)
    const [selectedDevice, setSelectedDevice] = useState<Device>()
    const { deleteWallet } = useWalletDeletion(selectedDevice)
    const navigation = useNavigation()
    const dispatch = useDispatch()
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
        ref: createWalletOrAccountBottomSheetRef,
        onOpen: openCreateWalletOrAccountBottomSheet,
        onClose: closeCreateWalletOrAccountBottomSheet,
    } = useBottomSheetModal()

    const {
        ref: addAccountBottomSheetRef,
        onOpen: openAddAccountBottomSheet,
        onClose: closeAddAccountBottomSheet,
    } = useBottomSheetModal()

    const { ref: walletMgmtBottomSheetRef, onOpen: openWalletMgmtSheet } =
        useBottomSheetModal()

    const {
        ref: removeWalletBottomSheetRef,
        onOpen: openRemoveWalletBottomSheet,
        onClose: closeRemoveWalletBottomSheet,
    } = useBottomSheetModal()

    const [isEdit, _setIsEdit] = useState(false)
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(
        new Map(),
    )
    const closeOtherSwipeableItems = useCallback(() => {
        swipeableItemRefs?.current.forEach(ref => {
            ref?.close()
        })
    }, [swipeableItemRefs])

    const setIsEdit = useCallback(
        (_isEdit: boolean) => {
            if (_isEdit) {
                closeOtherSwipeableItems()
                _setIsEdit(true)
            } else {
                _setIsEdit(false)
            }
        },
        [closeOtherSwipeableItems],
    )

    const onDeviceSelected = useCallback(
        (device: Device) => () => {
            closeOtherSwipeableItems()
            setSelectedDevice(device)
            openWalletMgmtSheet()
        },
        [closeOtherSwipeableItems, openWalletMgmtSheet],
    )

    const renderItem: RenderItem<Device> = useCallback(
        ({ item, drag, isActive }) => {
            return (
                <SwipeableRow
                    item={item}
                    itemKey={item.rootAddress}
                    swipeableItemRefs={swipeableItemRefs}
                    handleTrashIconPress={openRemoveWalletBottomSheet}
                    setSelectedItem={setSelectedDevice}
                    swipeEnabled={!isEdit && devices.length > 1}>
                    <DeviceBox
                        device={item}
                        isEdit={isEdit}
                        drag={drag}
                        isActive={isActive}
                        onDeviceSelected={onDeviceSelected}
                    />
                </SwipeableRow>
            )
        },
        [devices.length, isEdit, onDeviceSelected, openRemoveWalletBottomSheet],
    )

    const handleOnSuccessAddAccountBottomSheet = useCallback(() => {
        closeAddAccountBottomSheet()
        navigation.goBack()
    }, [closeAddAccountBottomSheet, navigation])

    const handleDragEnd = ({ data }: { data: Device[] }) => {
        dispatch(
            setDeviceState({
                updatedDevices: data.map((device, index) => ({
                    ...device,
                    position: index,
                })),
            }),
        )
    }

    return (
        <Layout
            safeAreaTestID="Wallet_Management_Screen"
            fixedHeader={
                <>
                    <WalletManagementHeader
                        openCreateWalletOrAccountBottomSheet={
                            openCreateWalletOrAccountBottomSheet
                        }
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                    />
                </>
            }
            fixedBody={
                <BaseView style={styles.view}>
                    <DraggableFlatList<Device>
                        data={devices}
                        extraData={isEdit}
                        onDragEnd={handleDragEnd}
                        keyExtractor={device => device.rootAddress}
                        renderItem={renderItem}
                        activationDistance={10}
                        showsVerticalScrollIndicator={false}
                        containerStyle={styles.draggableFlatListContainer}
                        contentContainerStyle={styles.contentContainerStyle}
                    />
                    <WalletMgmtBottomSheet
                        ref={walletMgmtBottomSheetRef}
                        device={selectedDevice}
                    />

                    <RemoveWalletWarningBottomSheet
                        onConfirm={checkIdentityBeforeOpening}
                        onClose={closeRemoveWalletBottomSheet}
                        selectedDevice={selectedDevice}
                        ref={removeWalletBottomSheetRef}
                    />

                    <CreateWalletOrAccountBottomSheet
                        onCreateAccount={openAddAccountBottomSheet}
                        onClose={closeCreateWalletOrAccountBottomSheet}
                        ref={createWalletOrAccountBottomSheetRef}
                    />

                    <AddAccountBottomSheet
                        ref={addAccountBottomSheetRef}
                        onSuccess={handleOnSuccessAddAccountBottomSheet}
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
    view: { flexGrow: 1 },
    draggableFlatListContainer: { flexGrow: 1 },

    contentContainerStyle: {
        paddingTop: 8,
    },
})
