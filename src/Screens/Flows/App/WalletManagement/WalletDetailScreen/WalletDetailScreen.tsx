import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    useBottomSheetModal,
    useCheckIdentity,
    useRenameWallet,
    useSetSelectedAccount,
    useThemedStyles,
    useVns,
} from "~Hooks"
import { AddressUtils } from "~Utils"
import {
    AlertInline,
    BaseSpacer,
    BaseView,
    Layout,
    RequireUserPassword,
    showSuccessToast,
    showWarningToast,
    SwipeableRow,
    useFeatureFlags,
} from "~Components"
import { useI18nContext } from "~i18n"
import { AccountDetailBox } from "./AccountDetailBox"
import { AccountWithDevice, DEVICE_TYPE, WalletAccount } from "~Model"
import { addAccountForDevice, renameAccount, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectAccountsByDevice, selectBalanceVisible, selectSelectedAccount } from "~Storage/Redux/Selectors"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useAccountDelete } from "./hooks"
import { AccountUnderlay, RemoveAccountWarningBottomSheet } from "./components"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { FlatList, StyleSheet } from "react-native"
import { EditHeaderIcon, PlusHeaderIcon } from "~Components/Reusable/HeaderRightIcons"
import { EditWalletAccountBottomSheet } from "./components/EditWalletAccountBottomSheet"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.WALLET_DETAILS>

export const WalletDetailScreen = ({ route: { params } }: Props) => {
    const { device } = params
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const { getVns } = useVns()
    const dispatch = useAppDispatch()

    const [walletAlias, setWalletAlias] = useState(device?.alias ?? "")
    const [openedAccount, setOpenedAccount] = useState<AccountWithDevice>()
    const [editingAccount, setEditingAccount] = useState<WalletAccount>()

    const { changeDeviceAlias } = useRenameWallet(device)
    const { subdomainClaimFeature } = useFeatureFlags()

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const deviceAccounts = useAppSelector(state => selectAccountsByDevice(state, device?.rootAddress))

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const claimableUsernames = useMemo(() => {
        const domains = getVns()

        if (!domains || domains.length === 0)
            return deviceAccounts
                .filter(accounts => accounts.device.type !== DEVICE_TYPE.LEDGER)
                .map(accounts => accounts.address)

        const noVnsAccounts = deviceAccounts
            .filter(account => {
                const isLedger = "device" in account && account.device.type === DEVICE_TYPE.LEDGER
                const isObservedAccount = "type" in account && account.type === DEVICE_TYPE.LOCAL_WATCHED
                const domain = domains.find(vns => AddressUtils.compareAddresses(vns.address, account.address))?.name
                return !isObservedAccount && !domain && !isLedger
            })
            .map(accounts => accounts.address)

        return noVnsAccounts
    }, [deviceAccounts, getVns])

    const {
        ref: removeAccountWarningBottomSheetRef,
        onOpen: openRemoveAccountWarningBottomSheet,
        onClose: closeRemoveAccountWarningBottomSheet,
    } = useBottomSheetModal()

    const {
        ref: editWalletAccountBottomSheetRef,
        onOpen: openEditWalletAccountBottomSheet,
        onClose: closeEditWalletAccountBottomSheet,
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

    const onRenameWallet = useCallback(
        (name: string) => {
            setWalletAlias(name)
            if (name === "") {
                changeDeviceAlias({ newAlias: device?.alias ?? "" })
            } else {
                changeDeviceAlias({ newAlias: name })
            }
        },
        [changeDeviceAlias, device],
    )

    const changeAccountAlias = useCallback(
        (name: string) => {
            if (!editingAccount) throw new Error("Wallet account not provided")
            dispatch(
                renameAccount({
                    address: editingAccount.address,
                    alias: name,
                }),
            )
        },
        [dispatch, editingAccount],
    )

    const onRenameAccount = useCallback(
        (name: string) => {
            if (!editingAccount) throw new Error("Wallet account not provided")
            if (name === "") {
                changeAccountAlias(editingAccount.alias ?? "")
            } else {
                changeAccountAlias(name)
            }
        },
        [changeAccountAlias, editingAccount],
    )

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

    const confirmEditWalletAccount = useCallback(
        (name: string) => {
            if (editingAccount) {
                onRenameAccount(name)
                setEditingAccount(undefined)
            } else {
                onRenameWallet(name)
            }
            closeEditWalletAccountBottomSheet()
        },
        [closeEditWalletAccountBottomSheet, editingAccount, onRenameAccount, onRenameWallet],
    )

    const cancelEditWalletAccount = useCallback(() => {
        if (editingAccount) setEditingAccount(undefined)
        closeEditWalletAccountBottomSheet()
    }, [closeEditWalletAccountBottomSheet, editingAccount])

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
    const isEditable = device?.type === DEVICE_TYPE.LOCAL_MNEMONIC

    return (
        <Layout
            title={walletAlias || device?.alias || ""}
            headerRightElement={
                <BaseView flexDirection="row" style={styles.headerActionsContainer}>
                    {isEditable && (
                        <EditHeaderIcon
                            testID="WalletDetailScreen_editWalletButton"
                            action={openEditWalletAccountBottomSheet}
                        />
                    )}
                    {showButton && (
                        <PlusHeaderIcon testID="WalletDetailScreen_addAccountButton" action={onAddAccountClicked} />
                    )}
                </BaseView>
            }
            fixedBody={
                <BaseView flex={1} flexGrow={1}>
                    <BaseView px={20} mb={16}>
                        <BaseSpacer height={16} />
                        {claimableUsernames.length > 0 && (
                            <AlertInline
                                variant="banner"
                                status="info"
                                message={`You have ${claimableUsernames.length} username claim available`}
                            />
                        )}
                    </BaseView>
                    {device && !!deviceAccounts.length && (
                        <FlatList
                            data={deviceAccounts}
                            keyExtractor={account => account.address}
                            extraData={openedAccount}
                            ListFooterComponent={<BaseSpacer height={20} />}
                            renderItem={({ item }) => {
                                const isSelected = AddressUtils.compareAddresses(selectedAccount.address, item.address)
                                const canClaimUsername = claimableUsernames.some(address =>
                                    AddressUtils.compareAddresses(address, item.address),
                                )
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
                                            canClaimUsername={subdomainClaimFeature.enabled && canClaimUsername}
                                            onEditPress={account => {
                                                setEditingAccount(account)
                                                openEditWalletAccountBottomSheet()
                                            }}
                                        />
                                    </SwipeableRow>
                                )
                            }}
                        />
                    )}
                    <RemoveAccountWarningBottomSheet
                        onConfirm={closeWarningAndAskForPassword}
                        ref={removeAccountWarningBottomSheetRef}
                        onCancel={closeRemoveAccountWarningBottomSheet}
                        accountToRemove={accountToRemove}
                        isBalanceVisible={isBalanceVisible}
                    />

                    <EditWalletAccountBottomSheet
                        ref={editWalletAccountBottomSheetRef}
                        accountAlias={editingAccount ? editingAccount.alias : device.alias}
                        type={editingAccount ? "account" : "wallet"}
                        onConfirm={confirmEditWalletAccount}
                        onCancel={cancelEditWalletAccount}
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

const baseStyles = () =>
    StyleSheet.create({
        headerActionsContainer: {
            gap: 8,
        },
    })
