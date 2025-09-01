import { BottomSheetSectionList } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo } from "react"
import { SectionListData } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, isSmallScreen } from "~Constants"
import { useScrollableBottomSheet, useTheme } from "~Hooks"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
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
     * If false, show the VET balance, otherwise VTHO. Defaults to false
     */
    isVthoBalance?: boolean
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

const SectionHeader = ({
    section,
}: {
    section: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
}) => {
    return <BaseText typographyFont="bodyMedium">{section.alias}</BaseText>
}

// component to select an account
export const SelectAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ closeBottomSheet, setSelectedAccount, selectedAccount, onDismiss, accounts, isVthoBalance = false }, ref) => {
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

            if (accounts.length === 5 && !isSmallScreen) {
                return isIOS() ? ["65%"] : ["55%"]
            }

            if (accounts.length < 6) {
                return ["75%"]
            }

            if (accounts.length < 8) return ["80%"]

            return ["90%"]
        }, [accounts.length])

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
                <BaseView flexDirection="row" alignItems="center" justifyContent="space-between">
                    <BaseView flexDirection="column" gap={8}>
                        <BaseView flexDirection="row" alignItems="center" gap={12}>
                            <BaseIcon
                                name="icon-wallet"
                                size={20}
                                color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_900}
                            />
                            <BaseText typographyFont="subTitleBold">{LL.SELECT_ACCOUNT_TITLE()}</BaseText>
                        </BaseView>
                        <BaseText typographyFont="body" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                            {LL.SELECT_ACCOUNT_DESCRIPTION()}
                        </BaseText>
                    </BaseView>
                </BaseView>

                <BaseSpacer height={12} />
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
                            testID="selectAccount"
                        />
                    )}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    SectionSeparatorComponent={ItemSeparatorComponent}
                    {...flatListScrollProps}
                    scrollEnabled
                />
            </BaseBottomSheet>
        )
    },
)
