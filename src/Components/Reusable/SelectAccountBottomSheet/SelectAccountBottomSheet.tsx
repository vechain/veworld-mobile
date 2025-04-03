import React, { useCallback, useMemo } from "react"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useScrollableBottomSheet } from "~Hooks"
import { AccountCard, BaseBottomSheet, BaseSpacer, BaseText } from "~Components"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { useI18nContext } from "~i18n"

/**
 * @typedef {object} Props
 * @prop {() => void} onDismiss - called on the bottom sheet dismiss
 * @prop {() => void} closeBottomSheet - called to close the bottom sheet
 * @prop {AccountWithDevice[]} accounts - list of accounts to display
 * @prop {(account?: AccountWithDevice) => void} setSelectedAccount - called when an account is selected
 * @prop {AccountWithDevice} [selectedAccount] - the selected account
 */
type Props = {
    onDismiss?: () => void
    closeBottomSheet?: () => void
    accounts: AccountWithDevice[]
    setSelectedAccount: (account: AccountWithDevice | WatchedAccount) => void
    selectedAccount?: AccountWithDevice
    isVthoBalance?: boolean
    isBalanceVisible?: boolean
}

const ItemSeparatorComponent = () => <BaseSpacer height={16} />

// component to select an account
export const SelectAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    (
        {
            closeBottomSheet,
            setSelectedAccount,
            selectedAccount,
            onDismiss,
            accounts,
            isVthoBalance = false,
            isBalanceVisible = true,
        },
        ref,
    ) => {
        const { LL } = useI18nContext()

        const handlePress = useCallback(
            (account: AccountWithDevice | WatchedAccount) => {
                setSelectedAccount(account)
                if (closeBottomSheet) closeBottomSheet()
            },
            [closeBottomSheet, setSelectedAccount],
        )

        const computeSnappoints = useMemo(() => {
            if (accounts.length < 4) {
                return ["50%"]
            }

            if (accounts.length < 6) {
                return ["75%"]
            }

            if (accounts.length >= 6) {
                return ["90%"]
            }

            return ["50%", "75%", "90%"]
        }, [accounts.length])

        const { flatListScrollProps, handleSheetChangePosition } = useScrollableBottomSheet({
            data: accounts,
            snapPoints: computeSnappoints,
        })

        return (
            <BaseBottomSheet
                snapPoints={computeSnappoints}
                ref={ref}
                onChange={handleSheetChangePosition}
                onDismiss={onDismiss}>
                <BaseText typographyFont="subTitleBold">{LL.COMMON_SELECT_ACCOUNT()}</BaseText>
                <BaseSpacer height={12} />
                <BottomSheetFlatList
                    data={accounts}
                    keyExtractor={account => account.address}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    renderItem={({ item }) => (
                        <AccountCard
                            testID="selectAccount"
                            account={item}
                            onPress={handlePress}
                            selected={item.address === selectedAccount?.address}
                            isVthoBalance={isVthoBalance}
                            isBalanceVisible={isBalanceVisible}
                        />
                    )}
                    {...flatListScrollProps}
                />
            </BaseBottomSheet>
        )
    },
)
