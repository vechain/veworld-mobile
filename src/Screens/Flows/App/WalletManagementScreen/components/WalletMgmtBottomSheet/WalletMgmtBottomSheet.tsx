import React, { useCallback, useEffect, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useRenameWallet, useScrollableBottomSheet, useTheme } from "~Hooks"
import { AddressUtils } from "~Utils"
import {
    BaseBottomSheet,
    BaseBottomSheetTextInput,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    showSuccessToast,
} from "~Components"
import { useI18nContext } from "~i18n"
import { AccountDetailBox } from "./AccountDetailBox"
import { AccountWithDevice, DEVICE_TYPE, Device } from "~Model"
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
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { COLORS } from "~Constants"

type Props = {
    device?: Device
    confirmRemoveAccount: (account: AccountWithDevice) => void
}

const snapPoints = ["50%", "75%", "90%"]

export const WalletMgmtBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ device, confirmRemoveAccount }, ref) => {
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

    const accountsListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const { flatListScrollProps, handleSheetChangePosition } =
        useScrollableBottomSheet({ data: deviceAccounts, snapPoints })

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

    useEffect(() => {
        setWalletAlias(device?.alias ?? "")
    }, [device?.alias])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChangePosition}
            ref={ref}
            onDismiss={() => setWalletAlias(device?.alias ?? "")}>
            <BaseView
                flexDirection="row"
                w={100}
                justifyContent="space-between">
                <BaseText typographyFont="subTitleBold">
                    {walletAlias || device?.alias || ""}
                </BaseText>
                {device?.type !== DEVICE_TYPE.LOCAL_PRIVATE_KEY && (
                    <BaseButton
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
                        <BaseSpacer width={8} />
                        {LL.ADD_ACCOUNT()}
                    </BaseButton>
                )}
            </BaseView>
            <BaseSpacer height={16} />
            <BaseBottomSheetTextInput
                placeholder={
                    device?.alias || LL.WALLET_MANAGEMENT_WALLET_NAME()
                }
                value={walletAlias}
                setValue={onRenameWallet}
            />
            <BaseSpacer height={16} />
            <BaseText typographyFont="button">{LL.SB_ACCOUNTS()}</BaseText>
            <BaseSpacer height={16} />
            <BaseView flexDirection="row" style={baseStyles.list}>
                {device && !!deviceAccounts.length && (
                    <BottomSheetFlatList
                        data={deviceAccounts}
                        keyExtractor={account => account.address}
                        ItemSeparatorComponent={accountsListSeparator}
                        renderItem={({ item }) => {
                            const isSelected = AddressUtils.compareAddresses(
                                selectedAccount.address,
                                item.address,
                            )

                            return (
                                <AccountDetailBox
                                    confirmRemoveAccount={confirmRemoveAccount}
                                    isBalanceVisible={isBalanceVisible}
                                    account={item}
                                    isSelected={isSelected}
                                />
                            )
                        }}
                        {...flatListScrollProps}
                    />
                )}
            </BaseView>
        </BaseBottomSheet>
    )
})

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
