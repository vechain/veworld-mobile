import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { useTheme } from "~Common"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"

import { Device, getUserPreferences, useRealm } from "~Storage"
import { useI18nContext } from "~i18n"
import { AccountDetailBox } from "./AccountDetailBox"
import { FlashList } from "@shopify/flash-list"

type Props = {
    device?: Device
    onClose: () => void
}

export const WalletManagementBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ device }, ref) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const { store } = useRealm()
    const userPreferences = getUserPreferences(store)

    const snapPoints = useMemo(() => ["50%", "75%", "90%"], [])

    const handleSheetChanges = useCallback((index: number) => {
        console.log("walletManagementSheet position changed", index)
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
            <BaseView h={100} flexDirection="row">
                {device && (
                    <FlashList
                        data={device.accounts}
                        keyExtractor={account => account.address}
                        ItemSeparatorComponent={accountsListSeparator}
                        renderItem={({ item }) => {
                            return (
                                <AccountDetailBox
                                    account={item}
                                    selectedAccount={
                                        userPreferences.selectedAccount!
                                    }
                                />
                            )
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        estimatedItemSize={device.accounts.length}
                        estimatedListSize={{
                            height: 184,
                            width:
                                152 * device.accounts.length +
                                (device.accounts.length - 1) * 16,
                        }}
                    />
                )}
            </BaseView>
        </BaseBottomSheet>
    )
})
