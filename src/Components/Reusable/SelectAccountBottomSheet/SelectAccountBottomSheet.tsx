import { TouchableOpacity as BSTouchableOpacity } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo, useState } from "react"
import { SectionList, SectionListData, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useScrollableBottomSheetList, useScrollableBottomSheetListWrapper } from "~Hooks/useScrollableBottomSheetList"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { AccountUtils } from "~Utils"
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

const KEYS = ["YOUR_WALLETS", "WATCHING"] as const

// component to select an account
export const SelectAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ closeBottomSheet, setSelectedAccount, selectedAccount, onDismiss, accounts, isVthoBalance = false }, ref) => {
        const { LL } = useI18nContext()

        const { onResize, contentStyle } = useScrollableBottomSheetListWrapper()
        const scrollableListProps = useScrollableBottomSheetList({ onResize })
        const [selectedKey, setSelectedKey] = useState<(typeof KEYS)[number]>("YOUR_WALLETS")

        const handlePress = useCallback(
            (account: AccountWithDevice | WatchedAccount) => {
                setSelectedAccount(account)
                if (closeBottomSheet) closeBottomSheet()
            },
            [closeBottomSheet, setSelectedAccount],
        )

        const { styles, theme } = useThemedStyles(baseStyles)

        const sections = useMemo(() => {
            if (selectedKey === "YOUR_WALLETS") {
                const groupedAccounts = accounts
                    .filter(account => !AccountUtils.isObservedAccount(account))
                    .reduce((acc, curr) => {
                        const key = curr.device?.alias ?? curr.alias
                        return { ...acc, [key]: [...(acc[key] ?? []), curr] }
                    }, {} as { [alias: string]: AccountWithDevice[] })
                return Object.entries(groupedAccounts).map(([alias, data]) => ({ alias, data }))
            }

            return [
                {
                    alias: LL.SELECT_ACCOUNT_TITLE(),
                    data: accounts.filter(AccountUtils.isObservedAccount),
                },
            ]
        }, [LL, accounts, selectedKey])

        const onSettingsClick = useCallback(() => {}, [])

        const labels = useMemo(() => [LL.SELECT_ACCOUNT_YOURS(), LL.SELECT_ACCOUNT_WATCHING()], [LL])

        return (
            <BaseBottomSheet
                dynamicHeight
                ref={ref}
                onDismiss={onDismiss}
                contentStyle={contentStyle}
                enableContentPanningGesture={false}>
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
                    <BSTouchableOpacity onPress={onSettingsClick} style={styles.settingsBtn}>
                        <BaseIcon name="icon-settings" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600} />
                    </BSTouchableOpacity>
                </BaseView>

                <BaseSpacer height={24} />

                <BaseTabs keys={KEYS} labels={labels} selectedKey={selectedKey} setSelectedKey={setSelectedKey} />

                <BaseSpacer height={24} />
                <SectionList
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
                    {...scrollableListProps}
                    scrollEnabled
                />
            </BaseBottomSheet>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        settingsBtn: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            padding: 8,
            borderWidth: 1,
            borderColor: theme.isDark ? "transparent" : COLORS.GREY_200,
        },
    })
