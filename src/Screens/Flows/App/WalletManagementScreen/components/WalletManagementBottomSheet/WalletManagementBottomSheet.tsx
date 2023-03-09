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

import { Device } from "~Storage"
import { useI18nContext } from "~i18n"
import { useAccountsList } from "~Common/Hooks/Entities"
import { AccountDetailBox } from "./AccountDetailBox"
import { FlashList } from "@shopify/flash-list"

type Props = {
    device: Device
    onClose: () => void
}

export const WalletManagementBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ device }, ref) => {
    const theme = useTheme()
    const accounts = useAccountsList()
    const { LL } = useI18nContext()

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
            <BaseView
                orientation="row"
                justify="space-between"
                w={100}
                align="center">
                <BaseText typographyFont="subTitle">
                    {LL.SB_EDIT_WALLET({ name: device.alias })}
                </BaseText>

                <BaseIcon
                    name={"pencil"}
                    size={24}
                    bg={theme.colors.secondary}
                    // action={()}
                />
            </BaseView>
            <BaseSpacer height={16} />
            <BaseTouchableBox action={() => {}}>
                <BaseText>{device.alias}</BaseText>
            </BaseTouchableBox>
            <BaseSpacer height={16} />
            <BaseText typographyFont="button">
                {LL.SB_RENAME_REORDER_ACCOUNTS()}
            </BaseText>
            <BaseSpacer height={16} />
            <BaseView h={100} w={100}>
                <FlashList
                    data={accounts}
                    keyExtractor={account => account.address}
                    // ListHeaderComponent={
                    //     <>
                    //         <WalletManagementHeader />
                    //         <BaseSpacer height={24} />
                    //     </>
                    // }
                    ItemSeparatorComponent={accountsListSeparator}
                    // contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => {
                        return <AccountDetailBox account={item} />
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={accounts.length}
                    estimatedListSize={{
                        height: 184,
                        width:
                            152 * accounts.length + (accounts.length - 1) * 16,
                    }}
                />
            </BaseView>
        </BaseBottomSheet>
    )
})
