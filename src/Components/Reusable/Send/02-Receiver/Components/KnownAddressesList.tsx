import React, { useCallback, useMemo, useState } from "react"
import { SectionList, StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { GenericAccountCard } from "~Components/Reusable/AccountCard"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, Contact } from "~Model"
import { selectAccounts, selectKnownContacts, selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"
import { AnimatedFilterChips } from "../../../AnimatedFilterChips"

type FilterItem = "recent" | "accounts" | "contacts"
type SectionItem = "MY_ACCOUNTS" | "WATCHING_ACCOUNTS"

const FILTER_ITEMS: FilterItem[] = ["recent", "accounts", "contacts"]

const AnimatedSectionList = Animated.createAnimatedComponent(
    SectionList<
        AccountWithDevice,
        {
            data: AccountWithDevice[]
            title: string
        }
    >,
)

export const KnownAddressesList = () => {
    const [selectedItem, setSelectedItem] = useState<FilterItem>("recent")
    const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined)

    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const currentAccount = useAppSelector(selectSelectedAccount)
    const allAccounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectKnownContacts)
    // const unknownContacts = useAppSelector(selectCachedContacts)

    const accounts = useMemo(() => {
        return allAccounts.filter(account => !AddressUtils.compareAddresses(account.address, currentAccount.address))
    }, [allAccounts, currentAccount.address])

    const accountsSection = useMemo(() => {
        const groupedAccounts = accounts.reduce((acc, curr) => {
            const key = !AccountUtils.isObservedAccount(curr) ? "MY_ACCOUNTS" : "WATCHING_ACCOUNTS"
            return { ...acc, [key]: [...(acc[key] ?? []), curr] }
        }, {} as Readonly<Record<SectionItem, AccountWithDevice[]>>)

        return Object.entries(groupedAccounts).map(([key, data]) => ({
            title: key,
            data,
        }))
    }, [accounts])

    const renderItem = useCallback(
        ({ item }: { item: AccountWithDevice | Contact }) => {
            const isSelected = AddressUtils.compareAddresses(selectedAccount, item.address)

            return (
                <GenericAccountCard
                    accountName={item.alias}
                    accountAddress={item.address}
                    onPress={({ accountAddress }) => {
                        setSelectedAccount(accountAddress)
                    }}
                    selected={isSelected}
                />
            )
        },
        [selectedAccount],
    )

    const renderSectionHeader = useCallback(
        ({ section }: { section: { title: string } }) => {
            return (
                <BaseText
                    typographyFont="captionSemiBold"
                    mb={-16}
                    color={theme.isDark ? COLORS.GREY_300 : COLORS.PURPLE}>
                    {LL[`SEND_ACCOUNTS_SECTION_TITLE_${section.title as SectionItem}`]()}
                </BaseText>
            )
        },
        [LL, theme.isDark],
    )

    const renderEmptyState = useCallback(() => {
        return (
            <BaseView flex={1} justifyContent="center" alignItems="center" gap={24}>
                <BaseView
                    justifyContent="center"
                    alignItems="center"
                    borderRadius={99}
                    bg={theme.isDark ? COLORS.PURPLE : COLORS.GREY_100}
                    p={16}>
                    <BaseIcon
                        name="icon-users"
                        size={32}
                        color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_400}
                    />
                </BaseView>
                <BaseView flexDirection="column" gap={4} alignItems="center">
                    <BaseText
                        typographyFont="subSubTitleSemiBold"
                        align="center"
                        color={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}>
                        {LL[`SEND_${selectedItem.toUpperCase() as Uppercase<FilterItem>}_EMPTY_STATE_TITLE`]()}
                    </BaseText>
                    <BaseText
                        typographyFont="body"
                        align="center"
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}>
                        {LL[`SEND_${selectedItem.toUpperCase() as Uppercase<FilterItem>}_EMPTY_STATE_DESCRIPTION`]()}
                    </BaseText>
                </BaseView>
            </BaseView>
        )
    }, [theme.isDark, LL, selectedItem])

    const renderItemSeparator = useCallback(() => <BaseSpacer height={8} />, [])

    const renderSectionSeparator = useCallback(() => <BaseSpacer height={24} />, [])

    return (
        <Animated.View style={styles.root} layout={LinearTransition}>
            <AnimatedFilterChips
                items={FILTER_ITEMS}
                selectedItem={selectedItem}
                scrollEnabled={false}
                contentContainerStyle={styles.filterContentContainer}
                chipStyle={styles.filterChip}
                keyExtractor={item => item}
                getItemLabel={item => LL[`SEND_RECEIVER_FILTER_${item.toUpperCase() as Uppercase<FilterItem>}`]()}
                onItemPress={item => {
                    setSelectedItem(item)
                }}
            />

            {selectedItem === "recent" && (
                <Animated.FlatList
                    data={[]}
                    style={styles.list}
                    contentContainerStyle={styles.listContentContainer}
                    keyExtractor={item => item.address}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderItemSeparator}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                />
            )}
            {selectedItem === "accounts" && (
                <AnimatedSectionList
                    sections={accountsSection}
                    renderSectionHeader={renderSectionHeader}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContentContainer}
                    style={styles.list}
                    keyExtractor={item => item.address}
                    ItemSeparatorComponent={renderItemSeparator}
                    SectionSeparatorComponent={renderSectionSeparator}
                    showsVerticalScrollIndicator={false}
                    layout={LinearTransition.duration(500)}
                    initialNumToRender={15}
                    scrollEnabled={accounts.length > 0}
                    stickySectionHeadersEnabled={false}
                    ListEmptyComponent={renderEmptyState}
                />
            )}
            {selectedItem === "contacts" && (
                <Animated.FlatList
                    data={contacts}
                    style={styles.list}
                    contentContainerStyle={styles.listContentContainer}
                    keyExtractor={item => item.address}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderItemSeparator}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={contacts.length > 0}
                />
            )}
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flexDirection: "column",
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.WHITE,
            borderRadius: 16,
            padding: 24,
            gap: 24,
            flex: 1,
        },
        filterContentContainer: {
            flex: 1,
            justifyContent: "space-between",
        },
        filterChip: {
            flex: 1,
        },
        list: { flexGrow: 1 },
        listContentContainer: { flexGrow: 1 },
    })
