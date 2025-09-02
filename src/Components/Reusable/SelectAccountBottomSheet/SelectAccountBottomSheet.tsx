import { TouchableOpacity as BSTouchableOpacity } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SectionList, SectionListData, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { COLORS, ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useScrollableBottomSheetList, useScrollableBottomSheetListWrapper } from "~Hooks/useScrollableBottomSheetList"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { AccountUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { SelectableAccountCard } from "../SelectableAccountCard"

export enum SelectAccountBottomSheetType {
    PERSONAL = "YOUR_WALLETS",
    WATCHING = "WATCHING",
}

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
const SectionSeparatorComponent = (props: {
    highlighted: boolean
    leadingItem?: AccountWithDevice
    leadingSection?: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
    trailingItem?: AccountWithDevice
    trailingSection?: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
    section: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
}) => {
    //If leadingItem is present, it means that it's trying to render the bottom section separator,
    //otherwise it's trying to render the separator between the header and the section
    return props.leadingItem ? <BaseSpacer height={24} /> : <BaseSpacer height={8} />
}

const SectionHeaderTitle = ({ children }: PropsWithChildren) => {
    const theme = useTheme()
    return (
        <BaseText typographyFont="bodyMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.PURPLE}>
            {children}
        </BaseText>
    )
}
const SectionHeader = ({
    section,
}: {
    section: SectionListData<AccountWithDevice, { data: AccountWithDevice[]; alias: string }>
}) => {
    return <SectionHeaderTitle>{section.alias}</SectionHeaderTitle>
}

// component to select an account
export const SelectAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ closeBottomSheet, setSelectedAccount, selectedAccount, onDismiss, accounts, isVthoBalance = false }, ref) => {
        const { LL } = useI18nContext()

        const { onResize, contentStyle, setSmallViewport } = useScrollableBottomSheetListWrapper()
        const initialLayout = useRef(false)
        const { resetHeight, ...scrollableListProps } = useScrollableBottomSheetList({ onResize, initialLayout })
        const [selectedKey, setSelectedKey] = useState<SelectAccountBottomSheetType>(
            SelectAccountBottomSheetType.PERSONAL,
        )

        const handlePress = useCallback(
            (account: AccountWithDevice | WatchedAccount) => {
                setSelectedAccount(account)
                if (closeBottomSheet) closeBottomSheet()
            },
            [closeBottomSheet, setSelectedAccount],
        )

        const { styles, theme } = useThemedStyles(baseStyles)

        const sections = useMemo(() => {
            if (selectedKey === SelectAccountBottomSheetType.PERSONAL) {
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

        const keys = useMemo(() => {
            const hasObserved = accounts.some(AccountUtils.isObservedAccount)
            return hasObserved
                ? [SelectAccountBottomSheetType.PERSONAL, SelectAccountBottomSheetType.WATCHING]
                : ([SelectAccountBottomSheetType.PERSONAL] as const)
        }, [accounts])

        const labels = useMemo(() => keys.map(key => LL[`SELECT_ACCOUNT_${key}`]()), [LL, keys])

        //Reset the state in order for the BS to fix its size
        useEffect(() => {
            setSmallViewport(false)
            initialLayout.current = false
            resetHeight()
        }, [resetHeight, selectedKey, setSmallViewport])

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

                {keys.length > 1 && (
                    <>
                        <BaseTabs
                            keys={keys}
                            labels={labels}
                            selectedKey={selectedKey}
                            setSelectedKey={setSelectedKey}
                        />

                        <BaseSpacer height={24} />
                    </>
                )}

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
                    SectionSeparatorComponent={SectionSeparatorComponent}
                    key={selectedKey}
                    showsVerticalScrollIndicator={false}
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
            borderRadius: 6,
        },
    })
