import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useScrollableBottomSheet, useTheme } from "~Hooks"
import { AddressUtils } from "~Utils"
import {
    BaseBottomSheet,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { AccountDetailBox } from "./AccountDetailBox"
import { Device } from "~Model"
import { useAppSelector } from "~Storage/Redux"
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
    onClose: () => void
    openRenameWalletBottomSheet: () => void
    openRemoveWalletBottomSheet: () => void
    canRemoveWallet: boolean
}

const snapPoints = ["50%", "75%", "90%"]

export const WalletMgmtBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(
    (
        {
            device,
            openRenameWalletBottomSheet,
            onClose,
            openRemoveWalletBottomSheet,
            canRemoveWallet,
        },
        ref,
    ) => {
        const theme = useTheme()
        const { LL } = useI18nContext()

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

        const onRenameWalletPress = useCallback(() => {
            onClose()
            openRenameWalletBottomSheet()
        }, [onClose, openRenameWalletBottomSheet])

        const onRemoveWalletPress = useCallback(() => {
            onClose()
            openRemoveWalletBottomSheet()
        }, [onClose, openRemoveWalletBottomSheet])

        const EditWalletIcon = useCallback(
            () => (
                <BaseIcon
                    haptics="Light"
                    name={"pencil"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={onRenameWalletPress}
                />
            ),
            [onRenameWalletPress, theme.colors.secondary],
        )

        const WalletIcons = useCallback(() => {
            if (canRemoveWallet) {
                return (
                    <BaseView w={30} style={baseStyles.rightSubContainer}>
                        <BaseIcon
                            haptics="Light"
                            name={"delete-outline"}
                            size={24}
                            bg={COLORS.MEDIUM_ORANGE}
                            action={onRemoveWalletPress}
                        />
                        <EditWalletIcon />
                    </BaseView>
                )
            } else {
                return <EditWalletIcon />
            }
        }, [EditWalletIcon, canRemoveWallet, onRemoveWalletPress])

        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                onChange={handleSheetChangePosition}
                ref={ref}>
                <BaseView
                    flexDirection="row"
                    w={100}
                    justifyContent="space-between">
                    <BaseText typographyFont="subTitleBold">
                        {LL.SB_EDIT_WALLET({ name: device?.alias ?? "" })}
                    </BaseText>

                    <WalletIcons />
                </BaseView>
                <BaseSpacer height={16} />
                <BaseTouchableBox action={() => {}}>
                    <BaseText>{device?.alias}</BaseText>
                </BaseTouchableBox>
                <BaseSpacer height={16} />
                <BaseText typographyFont="button">
                    {LL.SB_RENAME_REORDER_ACCOUNTS()}
                </BaseText>
                <BaseSpacer height={16} />
                <BaseView flexDirection="row" style={baseStyles.list}>
                    {device && !!deviceAccounts.length && (
                        <BottomSheetFlatList
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
    },
)

const baseStyles = StyleSheet.create({
    list: {
        height: "78%",
    },
    rightSubContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
})
