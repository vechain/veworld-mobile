import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { AddressUtils, useTheme } from "~Common"
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
import { Device } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import {
    selectAccountsByDevice,
    selectSelectedAccount,
} from "~Storage/Redux/Selectors"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"

type Props = {
    device?: Device
    onClose: () => void
}

export const AccountMgmtBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ device }, ref) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const snapPoints = useMemo(() => ["50%", "75%", "90%"], [])

    const deviceAccounts = useAppSelector(
        selectAccountsByDevice(device?.rootAddress),
    )

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const [snapIndex, setSnapIndex] = useState<number>(0)

    // The list is scrollable when the bottom sheet is fully expanded
    const isListScrollable = useMemo(
        () => snapIndex === snapPoints.length - 1,
        [snapIndex, snapPoints],
    )

    const handleSheetChanges = useCallback((index: number) => {
        console.log("walletManagementSheet position changed", index)
        setSnapIndex(index)
    }, [])

    const accountsListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            ref={ref}>
            <BaseView flexDirection="row" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.SB_EDIT_WALLET({ name: device?.alias })}
                </BaseText>

                <BaseIcon
                    name={"pencil"}
                    size={24}
                    bg={theme.colors.secondary}
                    disabled
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
                                selectedAccount?.address,
                                item.address,
                            )

                            return (
                                <AccountDetailBox
                                    account={item}
                                    isSelected={isSelected}
                                />
                            )
                        }}
                        scrollEnabled={isListScrollable}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
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
