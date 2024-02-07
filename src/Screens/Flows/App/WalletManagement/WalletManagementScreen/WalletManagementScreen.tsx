import React, { useCallback, useMemo, useRef, useState } from "react"
import { BaseView, DeviceBox, Layout, RequireUserPassword, SwipeableRow, showWarningToast } from "~Components"
import { BaseDevice, Device } from "~Model"
import { setDeviceState, useAppSelector } from "~Storage/Redux"
import { selectAccounts, selectDevices } from "~Storage/Redux/Selectors"
import { RemoveWalletWarningBottomSheet, WalletManagementHeader } from "./components"
import { useWalletDeletion } from "./hooks"
import { StyleSheet } from "react-native"
import { useBottomSheetModal, useCheckIdentity, useTabBarBottomMargin } from "~Hooks"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import DraggableFlatList, { RenderItem } from "react-native-draggable-flatlist"
import { useDispatch } from "react-redux"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { AccountUtils } from "~Utils"

export const WalletManagementScreen = () => {
    const { tabBarBottomMargin } = useTabBarBottomMargin()
    const devices = useAppSelector(selectDevices)
    const accounts = useAppSelector(selectAccounts)
    const [selectedDevice, setSelectedDevice] = useState<Device>()
    const [deviceToRemove, setDeviceToRemove] = useState<Device>()
    const { deleteWallet } = useWalletDeletion(selectedDevice)
    const { LL } = useI18nContext()
    const dispatch = useDispatch()

    const { isPasswordPromptOpen, handleClosePasswordModal, onPasswordSuccess, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: deleteWallet,
            allowAutoPassword: false,
        })

    const {
        ref: removeWalletBottomSheetRef,
        onOpen: openRemoveWalletBottomSheet,
        onClose: closeRemoveWalletBottomSheet,
    } = useBottomSheetModal()

    const [isEdit, _setIsEdit] = useState(false)
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())
    const closeOtherSwipeableItems = useCallback(() => {
        swipeableItemRefs?.current.forEach(ref => {
            ref?.close()
        })
    }, [swipeableItemRefs])

    const allDevicesAndObservedAccounts = useMemo(() => {
        let allDevices: Device[] = [...devices]

        for (const account of accounts) {
            if (AccountUtils.isObservedAccount(account)) {
                allDevices.push({ ...account, wallet: "", position: -1 })
            }
        }

        return allDevices
    }, [accounts, devices])

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

    const nav = useNavigation()
    const onDeviceSelected = useCallback(
        (device: BaseDevice) => {
            closeOtherSwipeableItems()
            setSelectedDevice(device as Device)
            nav.navigate(Routes.WALLET_DETAILS, {
                device: device as Device,
            })
        },
        [closeOtherSwipeableItems, nav],
    )

    const onTrashIconPress = useCallback(
        (item: Device) => () => {
            if (AccountUtils.isObservedAccount(item)) {
                setSelectedDevice(item)
                openRemoveWalletBottomSheet()
            } else {
                if (devices.length > 1) {
                    setSelectedDevice(item)
                    openRemoveWalletBottomSheet()
                } else {
                    showWarningToast({
                        text1: LL.WALLET_MANAGEMENT_NOTIFICATION_LAST_WALLET(),
                    })
                }
            }
        },
        [LL, devices.length, openRemoveWalletBottomSheet],
    )

    const renderItem: RenderItem<Device> = useCallback(
        ({ item, drag, isActive }) => {
            return (
                <SwipeableRow
                    item={item}
                    itemKey={item.rootAddress}
                    swipeableItemRefs={swipeableItemRefs}
                    handleTrashIconPress={onTrashIconPress(item)}
                    setSelectedItem={setDeviceToRemove}
                    swipeEnabled={!isEdit}
                    onPress={onDeviceSelected}
                    isDragMode={isEdit}
                    isOpen={deviceToRemove === item}>
                    <DeviceBox device={item} isEdit={isEdit} drag={drag} isActive={isActive} />
                </SwipeableRow>
            )
        },
        [deviceToRemove, isEdit, onDeviceSelected, onTrashIconPress],
    )

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
    const navigation = useNavigation()

    const goToCreateWalletFlow = useCallback(() => {
        navigation.navigate(Routes.CREATE_WALLET_FLOW)
    }, [navigation])

    return (
        <Layout
            safeAreaTestID="Wallet_Management_Screen"
            fixedHeader={
                <>
                    <WalletManagementHeader
                        goToCreateWalletFlow={goToCreateWalletFlow}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                    />
                </>
            }
            fixedBody={
                <BaseView style={styles.view} mb={tabBarBottomMargin}>
                    <DraggableFlatList<Device>
                        data={allDevicesAndObservedAccounts}
                        extraData={isEdit}
                        onDragEnd={handleDragEnd}
                        keyExtractor={device => device.rootAddress}
                        renderItem={renderItem}
                        activationDistance={10}
                        showsVerticalScrollIndicator={false}
                        containerStyle={styles.draggableFlatListContainer}
                        contentContainerStyle={styles.contentContainerStyle}
                    />

                    <RemoveWalletWarningBottomSheet
                        onConfirm={checkIdentityBeforeOpening}
                        onClose={closeRemoveWalletBottomSheet}
                        selectedDevice={selectedDevice}
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
    view: { flexGrow: 1 },
    draggableFlatListContainer: { flexGrow: 1 },

    contentContainerStyle: {
        paddingTop: 8,
        paddingBottom: 24,
    },
})
