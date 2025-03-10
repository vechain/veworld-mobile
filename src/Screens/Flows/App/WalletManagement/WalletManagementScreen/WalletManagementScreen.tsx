import React, { useCallback, useMemo, useRef, useState } from "react"
import {
    BaseText,
    BaseView,
    DeviceBox,
    Layout,
    RequireUserPassword,
    SwipeableRow,
    PlusIconHeaderButton,
    showWarningToast,
} from "~Components"
import { BaseDevice, Device } from "~Model"
import { setDeviceState, useAppSelector } from "~Storage/Redux"
import { selectAccounts, selectDevices } from "~Storage/Redux/Selectors"
import { CreateOrImportWalletBottomSheet, RemoveWalletWarningBottomSheet } from "./components"
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
import { useHandleWalletCreation } from "~Screens/Flows/Onboarding/WelcomeScreen/useHandleWalletCreation"
import { DerivationPath } from "~Constants"

export const WalletManagementScreen = () => {
    const { tabBarBottomMargin } = useTabBarBottomMargin()
    const devices = useAppSelector(selectDevices)
    const accounts = useAppSelector(selectAccounts)
    const [selectedDevice, setSelectedDevice] = useState<Device>()
    const [deviceToRemove, setDeviceToRemove] = useState<Device>()
    const { deleteWallet } = useWalletDeletion(selectedDevice)
    const { LL } = useI18nContext()
    const dispatch = useDispatch()

    const { createOnboardedWallet } = useHandleWalletCreation()

    const { isPasswordPromptOpen, handleClosePasswordModal, onPasswordSuccess, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: deleteWallet,
            allowAutoPassword: false,
        })

    const {
        isPasswordPromptOpen: isPasswordPromptOpen_1,
        handleClosePasswordModal: handleClosePasswordModal_1,
        onPasswordSuccess: onPasswordSuccess_1,
        checkIdentityBeforeOpening: checkIdentityBeforeOpening_1,
    } = useCheckIdentity({
        onIdentityConfirmed: (pin?: string) => createOnboardedWallet({ pin, derivationPath: DerivationPath.VET }),
        allowAutoPassword: false,
    })

    const {
        ref: removeWalletBottomSheetRef,
        onOpen: openRemoveWalletBottomSheet,
        onClose: closeRemoveWalletBottomSheet,
    } = useBottomSheetModal()

    const {
        ref: addWalletBottomSheetRef,
        onOpen: onOpenAddWalletBottomSheet,
        onClose: onCloseAddWalletBottomSheet,
    } = useBottomSheetModal()

    const handleOnCreateWallet = useCallback(async () => {
        onCloseAddWalletBottomSheet()
        await checkIdentityBeforeOpening_1()
    }, [onCloseAddWalletBottomSheet, checkIdentityBeforeOpening_1])

    const [isEdit] = useState(false)
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
                const filteredDevices = devices.filter(device => !AccountUtils.isObservedAccount(device))

                if (filteredDevices.length > 1) {
                    setSelectedDevice(item)
                    openRemoveWalletBottomSheet()
                } else {
                    showWarningToast({
                        text1: LL.WALLET_MANAGEMENT_NOTIFICATION_LAST_WALLET(),
                    })
                }
            }
        },
        [LL, devices, openRemoveWalletBottomSheet],
    )

    const renderItem: RenderItem<Device> = useCallback(
        ({ item, drag, isActive, getIndex }) => {
            return (
                <SwipeableRow
                    testID={`Wallet_${getIndex()}`}
                    item={item}
                    itemKey={item.rootAddress}
                    swipeableItemRefs={swipeableItemRefs}
                    handleTrashIconPress={onTrashIconPress(item)}
                    setSelectedItem={setDeviceToRemove}
                    swipeEnabled={!isEdit}
                    onPress={onDeviceSelected}
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

    const headerRightElement = useMemo(
        () => <PlusIconHeaderButton action={onOpenAddWalletBottomSheet} testID="Wallet_Management_AddWallet" />,
        [onOpenAddWalletBottomSheet],
    )

    return (
        <Layout
            safeAreaTestID="Wallet_Management_Screen"
            title={LL.TITLE_WALLET_MANAGEMENT()}
            headerRightElement={headerRightElement}
            fixedBody={
                <BaseView style={styles.view} mb={tabBarBottomMargin}>
                    <BaseView style={styles.subTitleContainer}>
                        <BaseText typographyFont="body">{LL.SB_WALLETS_MANAGEMENT()}</BaseText>
                    </BaseView>
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

                    <RequireUserPassword
                        isOpen={isPasswordPromptOpen_1}
                        onClose={handleClosePasswordModal_1}
                        onSuccess={onPasswordSuccess_1}
                    />

                    <CreateOrImportWalletBottomSheet
                        ref={addWalletBottomSheetRef}
                        onClose={onCloseAddWalletBottomSheet}
                        handleOnCreateWallet={handleOnCreateWallet}
                    />
                </BaseView>
            }
        />
    )
}

const styles = StyleSheet.create({
    view: { flexGrow: 1, paddingTop: 16 },
    subTitleContainer: {
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    draggableFlatListContainer: { flexGrow: 1 },
    contentContainerStyle: {
        paddingBottom: 24,
    },
})
