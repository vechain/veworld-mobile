import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    getClaimableUsernames,
    useBottomSheetModal,
    useCheckIdentity,
    usePrefetchAllVns,
    useRenameWallet,
    useSetSelectedAccount,
    useTheme,
} from "~Hooks"
import { AccountUtils, AddressUtils } from "~Utils"
import {
    AlertInline,
    BaseSpacer,
    BaseView,
    Layout,
    PlusIconHeaderButton,
    RequireUserPassword,
    showSuccessToast,
    showWarningToast,
    SwipeableRow,
    useFeatureFlags,
    EditIconHeaderButton,
    BaseText,
} from "~Components"
import { useI18nContext } from "~i18n"
import { AccountDetailBox } from "./AccountDetailBox"
import { AccountWithDevice, DEVICE_TYPE, WalletAccount, WatchedAccount } from "~Model"
import { addAccountForDevice, renameAccount, useAppDispatch, useAppSelector } from "~Storage/Redux"
import {
    selectAccountsByDevice,
    selectBalanceVisible,
    selectSelectedAccount,
    selectDevices,
    selectAccountByAddress,
} from "~Storage/Redux/Selectors"
import { AccountUnderlay, RemoveAccountWarningBottomSheet } from "./components"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { FlatList, Pressable } from "react-native"
import { EditWalletAccountBottomSheet } from "./components/EditWalletAccountBottomSheet"
import { RootStackParamListHome, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useAccountDelete } from "./hooks"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { DefaultStyle } from "react-native-reanimated/lib/typescript/reanimated2/hook/commonTypes"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.WALLET_DETAILS>

export const WalletDetailScreen = ({ route: { params } }: Props) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const theme = useTheme()

    const devices = useAppSelector(selectDevices)
    const device = useMemo(
        () => devices.find(d => d.rootAddress === params.device.rootAddress),
        [devices, params.device.rootAddress],
    )

    const isObservedWallet = !device && AccountUtils.isObservedAccount(params.device)

    const observedWallet = useAppSelector(state => selectAccountByAddress(state, params.device.rootAddress))

    const initialWalletAlias = useMemo(() => {
        if (isObservedWallet) return observedWallet?.alias ?? ""

        return device?.alias ?? ""
    }, [device?.alias, isObservedWallet, observedWallet?.alias])

    const [walletAlias, setWalletAlias] = useState(initialWalletAlias)
    const [openedAccount, setOpenedAccount] = useState<AccountWithDevice>()
    const [editingAccount, setEditingAccount] = useState<WalletAccount | WatchedAccount>()

    const { changeDeviceAlias } = useRenameWallet(device)
    const { data: domains, refetch: refetchVns } = usePrefetchAllVns()
    const { subdomainClaimFeature } = useFeatureFlags()
    const [claimableUsernames, setClaimableUsernames] = useState<string[]>([])

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const deviceAccounts = useAppSelector(state => selectAccountsByDevice(state, device?.rootAddress))

    const selectedAccount = useAppSelector(selectSelectedAccount)

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
        refetchVns()
        showSuccessToast({
            text1: LL.WALLET_MANAGEMENT_NOTIFICATION_CREATE_ACCOUNT_SUCCESS(),
        })
    }

    const onRenameWallet = useCallback(
        (name: string) => {
            setWalletAlias(name)
            if (name === "") {
                changeDeviceAlias({ newAlias: initialWalletAlias })
            } else {
                changeDeviceAlias({ newAlias: name })
            }
        },
        [changeDeviceAlias, initialWalletAlias],
    )

    const changeAccountAlias = useCallback(
        (name: string) => {
            if (!editingAccount) throw new Error("Wallet account not provided")
            if (isObservedWallet) setWalletAlias(name)
            dispatch(
                renameAccount({
                    address: editingAccount.address,
                    alias: name,
                }),
            )
        },
        [dispatch, editingAccount, isObservedWallet],
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
        [isOnlyAccount, LL, setAccountToRemove, openRemoveAccountWarningBottomSheet],
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
        setWalletAlias(initialWalletAlias)
    }, [initialWalletAlias])

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
    const isEditable = device && device?.type !== DEVICE_TYPE.LEDGER

    const bannerHeight = useSharedValue<DefaultStyle["height"]>(0)
    const bannerOpacity = useSharedValue<number>(0)

    const animatedStyles = useAnimatedStyle(() => {
        return {
            height: bannerHeight.value,
            opacity: bannerOpacity.value,
        }
    })

    useEffect(() => {
        bannerHeight.value = withSpring(claimableUsernames.length > 0 ? 45 : 0, {
            duration: 500,
            dampingRatio: 1,
            stiffness: 72,
            overshootClamping: true,
        })
        bannerOpacity.value = withSpring(claimableUsernames.length > 0 ? 1 : 0, { duration: 100 })
    }, [bannerHeight, bannerOpacity, claimableUsernames])

    useEffect(() => {
        getClaimableUsernames(domains, deviceAccounts).then(res => {
            setClaimableUsernames(res)
            refetchVns()
        })
    }, [domains, deviceAccounts, refetchVns])

    return (
        <Layout
            title={walletAlias ?? device?.alias ?? params.device.alias}
            headerRightElement={
                <>
                    {isEditable && (
                        <EditIconHeaderButton
                            testID="WalletDetailScreen_editWalletButton"
                            action={openEditWalletAccountBottomSheet}
                        />
                    )}
                    {showButton && (
                        <PlusIconHeaderButton
                            testID="WalletDetailScreen_addAccountButton"
                            action={onAddAccountClicked}
                        />
                    )}
                </>
            }
            fixedBody={
                <BaseView flex={1} flexGrow={1}>
                    <BaseView px={20} mb={16}>
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="body">
                            {LL.WALLET_DETAIL_ACCOUNTS_NUMER({ count: isObservedWallet ? 1 : deviceAccounts.length })}
                        </BaseText>
                        {claimableUsernames.length > 0 && (
                            <Animated.View style={[animatedStyles]}>
                                <BaseSpacer height={16} />
                                <AlertInline
                                    variant="banner"
                                    status="info"
                                    message={LL.SB_CLAIMABLE_ACCOUNTS({ usernames: claimableUsernames.length })}
                                />
                            </Animated.View>
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
                                const canClaimUsername = claimableUsernames.find(address =>
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
                                            canClaimUsername={subdomainClaimFeature.enabled && !!canClaimUsername}
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

                    {/* Account observed wallet account */}
                    {isObservedWallet && observedWallet && (
                        <BaseView px={20}>
                            <BaseView testID={observedWallet.address} bg={theme.colors.card} borderRadius={12}>
                                <Pressable
                                    onPress={() => {
                                        onSetSelectedAccount({
                                            address: observedWallet.rootAddress,
                                        })
                                    }}>
                                    <BaseView>
                                        <AccountDetailBox
                                            isBalanceVisible={isBalanceVisible}
                                            account={observedWallet}
                                            isSelected={AddressUtils.compareAddresses(
                                                selectedAccount.address,
                                                observedWallet.address,
                                            )}
                                            isDisabled={!observedWallet.visible}
                                            onEditPress={account => {
                                                setEditingAccount(account)
                                                openEditWalletAccountBottomSheet()
                                            }}
                                        />
                                    </BaseView>
                                </Pressable>
                            </BaseView>
                        </BaseView>
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
                        accountAlias={editingAccount ? editingAccount.alias : initialWalletAlias}
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
