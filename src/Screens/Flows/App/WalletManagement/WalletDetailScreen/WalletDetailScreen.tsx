import React, { useCallback, useEffect, useState } from "react"
import { useBottomSheetModal, useRenameWallet, useTheme } from "~Hooks"
import { AddressUtils } from "~Utils"
import {
    BaseTextInput,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    showSuccessToast,
    showWarningToast,
    Layout,
} from "~Components"
import { useI18nContext } from "~i18n"
import { AccountDetailBox } from "./AccountDetailBox"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import {
    addAccountForDevice,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import {
    selectAccountsByDevice,
    selectBalanceVisible,
    selectSelectedAccount,
} from "~Storage/Redux/Selectors"
import { StyleSheet } from "react-native"
import { COLORS } from "~Constants"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListHome, Routes } from "~Navigation"
import { FlashList } from "@shopify/flash-list"
import { useAccountDelete } from "./hooks"
import { RemoveAccountWarningBottomSheet } from "./components"

type Props = NativeStackScreenProps<
    RootStackParamListHome,
    Routes.WALLET_DETAILS
>

export const WalletDetailScreen = ({ route: { params } }: Props) => {
    const { device } = params
    const theme = useTheme()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const [walletAlias, setWalletAlias] = useState(device?.alias ?? "")
    const { changeDeviceAlias } = useRenameWallet(device)

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const deviceAccounts = useAppSelector(state =>
        selectAccountsByDevice(state, device?.rootAddress),
    )

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const {
        ref: removeAccountWarningBottomSheetRef,
        onOpen: openRemoveAccountWarningBottomSheet,
        onClose: closeRemoveAccountWarningBottomSheet,
    } = useBottomSheetModal()

    const accountsListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

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

    const { setAccountToRemove, deleteAccount, isOnlyAccount } =
        useAccountDelete()

    const confirmRemoveAccount = useCallback(
        (account: AccountWithDevice) => {
            if (isOnlyAccount(account.rootAddress))
                return showWarningToast({
                    text1: LL.NOTIFICATION_CANT_REMOVE_ONLY_ACCOUNT(),
                })

            setAccountToRemove(account)
            openRemoveAccountWarningBottomSheet()
        },
        [
            setAccountToRemove,
            LL,
            isOnlyAccount,
            openRemoveAccountWarningBottomSheet,
        ],
    )

    const onRemoveAccount = useCallback(() => {
        closeRemoveAccountWarningBottomSheet()
        deleteAccount()
    }, [closeRemoveAccountWarningBottomSheet, deleteAccount])

    useEffect(() => {
        setWalletAlias(device?.alias ?? "")
    }, [device?.alias])

    return (
        <Layout
            fixedHeader={
                <BaseView>
                    <BaseView
                        flexDirection="row"
                        w={100}
                        justifyContent="space-between">
                        <BaseView flex={1}>
                            <BaseText
                                typographyFont="subTitleBold"
                                ellipsizeMode="tail"
                                numberOfLines={1}>
                                {walletAlias || device?.alias || ""}
                            </BaseText>
                        </BaseView>
                        <BaseSpacer width={4} />
                        {device?.type !== DEVICE_TYPE.LOCAL_PRIVATE_KEY && (
                            <BaseButton
                                testID="WalletDetailScreen_addAccountButton"
                                haptics="Light"
                                action={onAddAccountClicked}
                                bgColor={theme.colors.secondary}
                                textColor={COLORS.DARK_PURPLE}
                                radius={30}
                                py={10}
                                leftIcon={
                                    <BaseIcon
                                        name="plus"
                                        size={20}
                                        color={COLORS.DARK_PURPLE}
                                    />
                                }>
                                <BaseSpacer width={2} />
                                {LL.ADD_ACCOUNT()}
                            </BaseButton>
                        )}
                    </BaseView>
                    <BaseSpacer height={16} />
                    <BaseTextInput
                        placeholder={
                            device?.alias || LL.WALLET_MANAGEMENT_WALLET_NAME()
                        }
                        value={walletAlias}
                        setValue={onRenameWallet}
                        maxLength={35}
                    />
                </BaseView>
            }
            body={
                <BaseView>
                    <BaseText typographyFont="button">
                        {LL.SB_ACCOUNTS()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseView flexDirection="row" style={baseStyles.list}>
                        {device && !!deviceAccounts.length && (
                            <FlashList
                                data={deviceAccounts}
                                keyExtractor={account => account.address}
                                ItemSeparatorComponent={accountsListSeparator}
                                renderItem={({ item }) => {
                                    const isSelected =
                                        AddressUtils.compareAddresses(
                                            selectedAccount.address,
                                            item.address,
                                        )

                                    return (
                                        <AccountDetailBox
                                            confirmRemoveAccount={
                                                confirmRemoveAccount
                                            }
                                            isBalanceVisible={isBalanceVisible}
                                            account={item}
                                            isSelected={isSelected}
                                        />
                                    )
                                }}
                            />
                        )}
                    </BaseView>
                    <RemoveAccountWarningBottomSheet
                        onConfirm={onRemoveAccount}
                        ref={removeAccountWarningBottomSheetRef}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = StyleSheet.create({
    list: {
        flex: 1,
        paddingBottom: 24,
    },
    rightSubContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
})
