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
import { DelegationType } from "~Model/Delegation"
import { selectAccountsButSelected, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
const snapPoints = ["40%"]

type Props = {
    onClose: () => void
    selectedDelegationOption: DelegationType
    setSelectedDelegationOption: (id: DelegationType) => void
    setSelectedAccount: (account?: AccountWithDevice) => void
    selectedAccount?: AccountWithDevice
}

// component to select an account for delegation
export const SelectAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(
    (
        {
            onClose,
            setSelectedDelegationOption,
            setSelectedAccount,
            selectedAccount,
            selectedDelegationOption,
        },
        ref,
    ) => {
        const { LL } = useI18nContext()
        const accounts = useAppSelector(selectAccountsButSelected)

        const onDismiss = () => {
            if (
                selectedDelegationOption === DelegationType.ACCOUNT &&
                !selectedAccount
            ) {
                setSelectedDelegationOption(DelegationType.NONE)
            }
        }

        const handlePress = (account: AccountWithDevice) => {
            setSelectedAccount(account)
            onClose()
        }

        const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
            useScrollableList(accounts, 0, snapPoints.length)

        return (
            <BaseBottomSheet
                snapPoints={snapPoints}
                ref={ref}
                onDismiss={onDismiss}>
                <BaseText typographyFont="subTitleBold">
                    {LL.SEND_DELEGATION_SELECT_ACCOUNT()}
                </BaseText>
                <BaseSpacer height={16} />
                <BaseView flexDirection="row" style={styles.list}>
                    <BottomSheetFlatList
                        data={accounts}
                        keyExtractor={account => account.address}
                        ItemSeparatorComponent={() => (
                            <BaseSpacer height={16} />
                        )}
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
        height: "78%",
    },
})
