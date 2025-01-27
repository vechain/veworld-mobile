import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import {
    BaseSpacer,
    BaseTextInput,
    BaseView,
    Layout,
    PlusIconHeaderButton,
    RequireUserPassword,
    showSuccessToast,
    showWarningToast,
    SwipeableRow,
} from "~Components"
import { useBottomSheetModal, useCheckIdentity, useRenameWallet, useSetSelectedAccount } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { addAccountForDevice, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectAccountsByDevice, selectBalanceVisible, selectSelectedAccount } from "~Storage/Redux/Selectors"
import { AddressUtils } from "~Utils"
import { AccountDetailBox } from "./AccountDetailBox"
import { AccountUnderlay, RemoveAccountWarningBottomSheet } from "./components"
import { useAccountDelete } from "./hooks"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.WALLET_DETAILS>

export const WalletDetailScreen = ({ route: { params } }: Props) => {
    const { device } = params
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const [walletAlias, setWalletAlias] = useState(device?.alias ?? "")
    const [openedAccount, setOpenedAccount] = useState<AccountWithDevice>()

    const { changeDeviceAlias } = useRenameWallet(device)

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const deviceAccounts = useAppSelector(state => selectAccountsByDevice(state, device?.rootAddress))

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const {
        ref: removeAccountWarningBottomSheetRef,
        onOpen: openRemoveAccountWarningBottomSheet,
        onClose: closeRemoveAccountWarningBottomSheet,
    } = useBottomSheetModal()

    const onAddAccountClicked = () => {
        if (!device) {
            throw new Error("Device is undefined when trying to add account")
        }

        dispatch(addAccountForDevice(device))
        showSuccessToast({
            text1: LL.WALLET_MANAGEMENT_NOTIFICATION_CREATE_ACCOUNT_SUCCESS(),
        })
    }

    const onRenameWallet = (name: string) => {
        setWalletAlias(name)
        if (name === "") {
            changeDeviceAlias({ newAlias: device?.alias ?? "" })
        } else {
            changeDeviceAlias({ newAlias: name })
        }
    }

    const { setAccountToRemove, deleteAccount, isOnlyAccount, accountToRemove } = useAccountDelete()

    const confirmRemoveAccount = useCallback(
        (account: AccountWithDevice) => {
            if (isOnlyAccount(account.rootAddress))
                return showWarningToast({
                    text1: LL.NOTIFICATION_CANT_REMOVE_ONLY_ACCOUNT(),
                })

            setAccountToRemove(account)
            openRemoveAccountWarningBottomSheet()
        },
        [setAccountToRemove, LL, isOnlyAccount, openRemoveAccountWarningBottomSheet],
    )

    useEffect(() => {
        setWalletAlias(device?.alias ?? "")
    }, [device?.alias])

    const { onSetSelectedAccount } = useSetSelectedAccount()

    // delete account logic
    const { isPasswordPromptOpen, handleClosePasswordModal, onPasswordSuccess, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: deleteAccount,
            allowAutoPassword: false,
        })
    const closeWarningAndAskForPassword = useCallback(() => {
        closeRemoveAccountWarningBottomSheet()
        checkIdentityBeforeOpening()
    }, [checkIdentityBeforeOpening, closeRemoveAccountWarningBottomSheet])

    const showButton = device?.type === DEVICE_TYPE.LEDGER || device?.type === DEVICE_TYPE.LOCAL_MNEMONIC
    const showWalletNameInput = device?.type !== DEVICE_TYPE.LOCAL_MNEMONIC

    const isItemSelected = useCallback(
        (account: AccountWithDevice) => {
            return AddressUtils.compareAddresses(selectedAccount.address, account.address)
        },
        [selectedAccount.address],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<AccountWithDevice>) => {
            const isSelected = isItemSelected(item)

            return (
                <SwipeableRow<AccountWithDevice>
                    testID={item.address}
                    item={item}
                    itemKey={item.address}
                    swipeableItemRefs={swipeableItemRefs}
                    handleTrashIconPress={() => confirmRemoveAccount(item)}
                    setSelectedItem={setOpenedAccount}
                    onPress={() => {
                        item.visible &&
                            onSetSelectedAccount({
                                address: item.address,
                            })
                    }}
                    isOpen={openedAccount?.address === item.address}
                    customUnderlay={
                        <AccountUnderlay
                            confirmRemoveAccount={confirmRemoveAccount}
                            account={item}
                            isSelected={isSelected}
                        />
                    }
                    snapPointsLeft={[140]}>
                    <AccountDetailBox
                        isBalanceVisible={isBalanceVisible}
                        account={item}
                        isSelected={isSelected}
                        isDisabled={!item.visible}
                    />
                </SwipeableRow>
            )
        },
        [confirmRemoveAccount, isBalanceVisible, isItemSelected, onSetSelectedAccount, openedAccount?.address],
    )

    return (
        <Layout
            title={walletAlias || device?.alias || ""}
            headerRightElement={
                showButton && (
                    <PlusIconHeaderButton testID="WalletDetailScreen_addAccountButton" action={onAddAccountClicked} />
                )
            }
            fixedHeader={
                <BaseView py={16}>
                    {!showWalletNameInput && (
                        <BaseTextInput
                            placeholder={device?.alias || LL.WALLET_MANAGEMENT_WALLET_NAME()}
                            value={walletAlias}
                            setValue={onRenameWallet}
                            maxLength={35}
                        />
                    )}
                </BaseView>
            }
            fixedBody={
                <BaseView flex={1} flexGrow={1}>
                    {device && !!deviceAccounts.length && (
                        <FlatList
                            data={deviceAccounts}
                            keyExtractor={account => account.address}
                            extraData={openedAccount}
                            ListHeaderComponent={<BaseSpacer height={20} />}
                            ListFooterComponent={<BaseSpacer height={20} />}
                            renderItem={renderItem}
                        />
                    )}
                    <RemoveAccountWarningBottomSheet
                        onConfirm={closeWarningAndAskForPassword}
                        ref={removeAccountWarningBottomSheetRef}
                        onCancel={closeRemoveAccountWarningBottomSheet}
                        accountToRemove={accountToRemove}
                        isBalanceVisible={isBalanceVisible}
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
