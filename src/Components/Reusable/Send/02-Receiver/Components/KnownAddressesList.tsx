import React, { useCallback, useEffect, useMemo, useState } from "react"
import { SectionList, StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { GenericAccountCard } from "~Components/Reusable/AccountCard"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, Contact, ContactType, RecentContact } from "~Model"
import {
    selectAccounts,
    selectKnownContacts,
    selectRecentContacts,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
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

type Props = {
    selectedAddress?: string
    activeFilter?: FilterItem
    onAddressChange: (address: string, context: "recent" | "accounts" | "contacts") => void
}

export const KnownAddressesList = ({ selectedAddress, activeFilter, onAddressChange }: Props) => {
    const [selectedItem, setSelectedItem] = useState<FilterItem>(activeFilter ?? "recent")

    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const currentAccount = useAppSelector(selectSelectedAccount)
    const allAccounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectKnownContacts)
    const recentContacts = useAppSelector(selectRecentContacts)

    const accounts = useMemo(() => {
        return allAccounts.filter(account => !AddressUtils.compareAddresses(account.address, currentAccount.address))
    }, [allAccounts, currentAccount.address])

    const accountsSection = useMemo(() => {
        const groupedAccounts = accounts.reduce((acc, curr) => {
            const key = AccountUtils.isObservedAccount(curr) ? "WATCHING_ACCOUNTS" : "MY_ACCOUNTS"
            return { ...acc, [key]: [...(acc[key] ?? []), curr] }
        }, {} as Readonly<Record<SectionItem, AccountWithDevice[]>>)

        return Object.entries(groupedAccounts).map(([key, data]) => ({
            title: key,
            data,
        }))
    }, [accounts])

    const renderItem = useCallback(
        ({
            item,
            context,
        }: {
            item: AccountWithDevice | Contact | RecentContact
            context: "recent" | "accounts" | "contacts"
        }) => {
            const isSelected = AddressUtils.compareAddresses(selectedAddress, item.address)
            const isContact = "type" in item && item.type === ContactType.KNOWN
            return (
                <GenericAccountCard
                    accountName={item.alias}
                    accountAddress={item.address}
                    onPress={({ accountAddress }) => {
                        onAddressChange(accountAddress, context)
                    }}
                    selected={isSelected}
                    isContact={isContact}
                />
            )
        },
        [selectedAddress, onAddressChange],
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
            <BaseView
                testID="Send_Receiver_Addresses_List_Empty_State"
                flex={1}
                justifyContent="center"
                alignItems="center"
                gap={24}
                pb={24}>
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

    //Update selected item when active filter changes from parent
    useEffect(() => {
        setSelectedItem(activeFilter ?? "recent")
    }, [activeFilter, setSelectedItem])

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
                    testID="Send_Receiver_Addresses_List_Recent_Contacts"
                    data={recentContacts}
                    extraData={{ context: "recent" }}
                    style={styles.list}
                    contentContainerStyle={styles.listContentContainer}
                    keyExtractor={item => item.address}
                    renderItem={({ item }) => renderItem({ item, context: "recent" })}
                    ItemSeparatorComponent={renderItemSeparator}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    layout={LinearTransition.duration(500)}
                />
            )}
            {selectedItem === "accounts" && (
                <AnimatedSectionList
                    testID="Send_Receiver_Addresses_List_Accounts"
                    sections={accountsSection}
                    extraData={{ context: "accounts" }}
                    renderSectionHeader={renderSectionHeader}
                    renderItem={({ item }) => renderItem({ item, context: "accounts" })}
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
                    testID="Send_Receiver_Addresses_List_Contacts"
                    data={contacts}
                    extraData={{ context: "contacts" }}
                    style={styles.list}
                    contentContainerStyle={styles.listContentContainer}
                    keyExtractor={item => item.address}
                    renderItem={({ item }) => renderItem({ item, context: "contacts" })}
                    ItemSeparatorComponent={renderItemSeparator}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    layout={LinearTransition.duration(500)}
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
            paddingBottom: 0,
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
        listContentContainer: { flexGrow: 1, paddingBottom: 24 },
    })
