import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo } from "react"
import { AccountCard, BaseBottomSheet, BaseSpacer, BaseText } from "~Components"
import { useScrollableBottomSheet } from "~Hooks"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { useI18nContext } from "~i18n"
import { SelectableAccountCard } from "../SelectableAccountCard"

type Props = {
    /**
     * Called on the bottom sheet dismiss
     */
    onDismiss?: () => void
    /**
     * Called to close the bottom sheet
     */
    closeBottomSheet?: () => void
    /**
     * List of accounts to display
     */
    accounts: AccountWithDevice[]
    /**
     * Called when an account is selected
     * @param account New selected account
     */
    setSelectedAccount: (account: AccountWithDevice | WatchedAccount) => void
    /**
     * The selected account
     */
    selectedAccount?: AccountWithDevice
    /**
     * If false, show the VET balance, otherwise VTHO. Defaults to false (only works with `cardVersion` = 'v1')
     */
    isVthoBalance?: boolean
    /**
     * If false the balance is not visible. Defaults to `true`
     */
    isBalanceVisible?: boolean
    /**
     * Set the version of the card.
     * V1 is the old one: {@link AccountCard}
     * V2 is the new one: {@link SelectableAccountCard}
     */
    cardVersion?: "v1" | "v2"
}

const ItemSeparatorComponent = ({ cardVersion = "v1" }: Pick<Props, "cardVersion">) => (
    <BaseSpacer height={cardVersion === "v1" ? 16 : 8} />
)

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
            cardVersion = "v1",
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
                    ItemSeparatorComponent={ItemSeparatorComponent.bind(null, { cardVersion })}
                    renderItem={({ item }) =>
                        cardVersion === "v1" ? (
                            <AccountCard
                                testID="selectAccount"
                                account={item}
                                onPress={handlePress}
                                selected={item.address === selectedAccount?.address}
                                isVthoBalance={isVthoBalance}
                                isBalanceVisible={isBalanceVisible}
                            />
                        ) : (
                            <SelectableAccountCard
                                account={item}
                                onPress={handlePress}
                                selected={item.address === selectedAccount?.address}
                            />
                        )
                    }
                    {...flatListScrollProps}
                />
            </BaseBottomSheet>
        )
    },
)
