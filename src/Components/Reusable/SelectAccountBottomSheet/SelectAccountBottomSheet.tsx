import { BottomSheetFlatList, BottomSheetSectionList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo } from "react"
import { SectionListData } from "react-native"
import { AccountCard, BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useScrollableBottomSheet, useTheme } from "~Hooks"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { useI18nContext } from "~i18n"
import { SelectableAccountCard } from "../SelectableAccountCard"

type Props = {
    /**
     * Called on the bottom sheet dismiss
     */
    /**
     * Called on the bottom sheet dismiss
     */
    onDismiss?: () => void
    /**
     * Called to close the bottom sheet
     */
    /**
     * Called to close the bottom sheet
     */
    closeBottomSheet?: () => void
    /**
     * List of accounts to display
     */
    /**
     * List of accounts to display
     */
    accounts: AccountWithDevice[]
    /**
     * Called when an account is selected
     * @param account New selected account
     */
    /**
     * Called when an account is selected
     * @param account New selected account
     */
    setSelectedAccount: (account: AccountWithDevice | WatchedAccount) => void
    /**
     * The selected account
     */
    /**
     * The selected account
     */
    selectedAccount?: AccountWithDevice
    /**
     * If false, show the VET balance, otherwise VTHO. Defaults to false (only works with `cardVersion` = 'v1')
     */
    /**
     * If false, show the VET balance, otherwise VTHO. Defaults to false (only works with `cardVersion` = 'v1')
     */
    isVthoBalance?: boolean
    /**
     * If false the balance is not visible. Defaults to `true`
     */
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

const SectionHeader = ({
    section,
}: {
    section: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
}) => {
    return <BaseText typographyFont="bodyMedium">{section.alias}</BaseText>
}

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

            // Card Version v1 is way bigger, so it needs more space
            if (cardVersion === "v1") return ["90%"]

            if (accounts.length < 8) return ["80%"]

            return ["90%"]
        }, [accounts.length, cardVersion])

        const { flatListScrollProps, handleSheetChangePosition } = useScrollableBottomSheet({
            data: accounts,
            snapPoints: computeSnappoints,
        })

        const theme = useTheme()

        const sections = useMemo(() => {
            const groupedAccounts = accounts.reduce((acc, curr) => {
                const key = curr.device?.alias ?? curr.alias
                return { ...acc, [key]: [...(acc[key] ?? []), curr] }
            }, {} as { [alias: string]: AccountWithDevice[] })
            return Object.entries(groupedAccounts).map(([alias, data]) => ({ alias, data }))
        }, [accounts])

        return (
            <BaseBottomSheet
                snapPoints={computeSnappoints}
                ref={ref}
                onChange={handleSheetChangePosition}
                onDismiss={onDismiss}>
                <BaseView flexDirection="row" alignItems="center" gap={12}>
                    <BaseIcon name="icon-wallet" size={20} color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_900} />
                    <BaseText typographyFont="subTitleBold">{LL.COMMON_SELECT_ACCOUNT()}</BaseText>
                </BaseView>

                <BaseSpacer height={12} />
                {cardVersion === "v1" ? (
                    <BottomSheetFlatList
                        data={accounts}
                        keyExtractor={account => account.address}
                        ItemSeparatorComponent={ItemSeparatorComponent.bind(null, { cardVersion })}
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
                ) : (
                    <BottomSheetSectionList
                        sections={sections}
                        keyExtractor={item => item.address}
                        renderSectionHeader={SectionHeader}
                        stickySectionHeadersEnabled={false}
                        renderItem={({ item }) => (
                            <SelectableAccountCard
                                account={item}
                                onPress={handlePress}
                                selected={item.address === selectedAccount?.address}
                                balanceToken={isVthoBalance ? "VTHO" : "VET"}
                            />
                        )}
                        ItemSeparatorComponent={ItemSeparatorComponent.bind(null, { cardVersion })}
                        SectionSeparatorComponent={ItemSeparatorComponent.bind(null, { cardVersion })}
                    />
                )}
            </BaseBottomSheet>
        )
    },
)
