import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { StyleSheet } from "react-native"
import { useScrollableList } from "~Common"
import {
    AccountCard,
    BaseBottomSheet,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { AccountWithDevice } from "~Model"
import { selectAccountsButSelected, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
const snapPoints = ["40%"]

/**
 * @typedef {object} Props
 * @prop {() => void} onDismiss - called on the bottom sheet dismiss
 * @prop {() => void} closeBottomSheet - called to close the bottom sheet
 * @prop {AccountWithDevice[]} accounts - list of accounts to display
 * @prop {(account?: AccountWithDevice) => void} setSelectedAccount - called when an account is selected
 * @prop {AccountWithDevice} [selectedAccount] - the selected account
 */
type Props = {
    onDismiss: () => void
    closeBottomSheet: () => void
    accounts: AccountWithDevice[]
    setSelectedAccount: (account?: AccountWithDevice) => void
    selectedAccount?: AccountWithDevice
}

const ItemSeparatorComponent = () => <BaseSpacer height={16} />

// component to select an account
export const SelectAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(
    (
        { closeBottomSheet, setSelectedAccount, selectedAccount, onDismiss },
        ref,
    ) => {
        const { LL } = useI18nContext()
        const accounts = useAppSelector(selectAccountsButSelected)
        const handlePress = (account: AccountWithDevice) => {
            setSelectedAccount(account)
            closeBottomSheet()
        }

        const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
            useScrollableList(accounts, 0, snapPoints.length)

        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                ref={ref}
                onDismiss={onDismiss}>
                <BaseText typographyFont="subTitleBold">
                    {LL.COMMON_SELECT_ACCOUNT()}
                </BaseText>
                <BaseSpacer height={16} />
                <BaseView flexDirection="row" style={styles.list}>
                    <BottomSheetFlatList
                        data={accounts}
                        keyExtractor={account => account.address}
                        ItemSeparatorComponent={ItemSeparatorComponent}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        renderItem={({ item }) => (
                            <AccountCard
                                account={item}
                                onPress={handlePress}
                                selected={
                                    item.address === selectedAccount?.address
                                }
                            />
                        )}
                        scrollEnabled={isListScrollable}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)

const styles = StyleSheet.create({
    list: {
        height: "70%",
    },
})
