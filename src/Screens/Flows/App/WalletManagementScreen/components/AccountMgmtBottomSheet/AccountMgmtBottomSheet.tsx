import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useScrollableBottomSheet, useTheme } from "~Hooks"
import { AddressUtils } from "~Utils"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    BaseBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { AccountDetailBox } from "./AccountDetailBox"
import { BaseDevice } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import {
    selectAccountsByDevice,
    selectBalanceVisible,
    selectSelectedAccount,
} from "~Storage/Redux/Selectors"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"

type Props = {
    device?: BaseDevice
    onClose: () => void
    openRenameAccountBottomSheet: () => void
}

const snapPoints = ["50%", "75%", "90%"]

export const AccountMgmtBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ device, openRenameAccountBottomSheet, onClose }, ref) => {
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
        openRenameAccountBottomSheet()
    }, [onClose, openRenameAccountBottomSheet])

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

                <BaseIcon
                    haptics="Light"
                    name={"pencil"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={onRenameWalletPress}
                />
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
                            const isSelected = AddressUtils.compareAddresses(
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
})

const baseStyles = StyleSheet.create({
    list: {
        height: "78%",
    },
})
