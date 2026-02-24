import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, SectionList, StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { GenericAccountCard } from "~Components/Reusable/AccountCard"
import { COLORS, ColorThemeType, ERROR_EVENTS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useDeferredRefAction } from "~Hooks/useDeferredRefAction"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, Contact, ContactType, RecentContact } from "~Model"
import {
    selectAccounts,
    selectKnownContacts,
    selectRecentContacts,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, warn } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"
import { AnimatedFilterChips } from "../../../AnimatedFilterChips"

type FilterItem = "recent" | "accounts" | "contacts"
type SectionItem = "MY_ACCOUNTS" | "WATCHING_ACCOUNTS"
type PendingScroll =
    | { kind: "recent"; index: number; retries: number }
    | { kind: "contacts"; index: number; retries: number }
    | { kind: "accounts"; sectionIndex: number; itemIndex: number; retries: number }

const FILTER_ITEMS: FilterItem[] = ["recent", "accounts", "contacts"]
const MAX_SCROLL_RETRIES = 3
const SCROLL_RETRY_DELAY_MS = 120

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
    /**
     * The real address of the user, it is the address that the user has entered in the input field
     */
    realAddress?: string
    activeFilter?: FilterItem
    onAddressChange: (address: string, context: "recent" | "accounts" | "contacts") => void
}

export const KnownAddressesList = ({ realAddress, activeFilter, onAddressChange }: Props) => {
    const [selectedItem, setSelectedItem] = useState<FilterItem>(activeFilter ?? "recent")
    const pendingScrollRef = useRef<PendingScroll | null>(null)
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const { setNodeRef: setRecentsRef, runWhenReady: runRecentWhenReady } =
        useDeferredRefAction<FlatList<RecentContact>>()

    const { setNodeRef: setAccountsRef, runWhenReady: runAccountsWhenReady } =
        useDeferredRefAction<SectionList<AccountWithDevice, { data: AccountWithDevice[]; title: string }>>()

    const { setNodeRef: setContactsRef, runWhenReady: runContactsWhenReady } = useDeferredRefAction<FlatList<Contact>>()

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
            const isSelected = AddressUtils.compareAddresses(realAddress, item.address)
            const isContact = "type" in item && item.type === ContactType.KNOWN

            return (
                <GenericAccountCard
                    testID={"AccountCard_Item"}
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
        [realAddress, onAddressChange],
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

    const retryPendingScroll = useCallback(() => {
        if (!pendingScrollRef.current) return

        const pending = pendingScrollRef.current

        if (pending.retries >= MAX_SCROLL_RETRIES) {
            warn(ERROR_EVENTS.APP, "Scroll retry limit reached", JSON.stringify(pending))
            pendingScrollRef.current = null
            return
        }

        pendingScrollRef.current = { ...pending, retries: pending.retries + 1 }

        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current)
        }

        retryTimeoutRef.current = setTimeout(() => {
            const latestPending = pendingScrollRef.current
            if (!latestPending) return

            if (latestPending.kind === "recent") {
                runRecentWhenReady(list => {
                    list.scrollToIndex({
                        index: latestPending.index,
                        animated: true,
                    })
                })
                return
            }

            if (latestPending.kind === "contacts") {
                runContactsWhenReady(list => {
                    list.scrollToIndex({
                        index: latestPending.index,
                        animated: true,
                    })
                })
                return
            }

            runAccountsWhenReady(list => {
                list.scrollToLocation({
                    sectionIndex: latestPending.sectionIndex,
                    itemIndex: latestPending.itemIndex,
                    animated: true,
                    viewOffset: 24,
                })
            })
        }, SCROLL_RETRY_DELAY_MS)
    }, [runAccountsWhenReady, runContactsWhenReady, runRecentWhenReady])

    const onScrollToIndexFailed = useCallback(
        (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
            warn(ERROR_EVENTS.APP, "Failed to scroll to index", JSON.stringify(info))

            const pending = pendingScrollRef.current
            if (!pending) return

            if (pending.kind === "recent" && info.averageItemLength > 0) {
                runRecentWhenReady(list => {
                    list.scrollToOffset({
                        offset: info.averageItemLength * info.index,
                        animated: false,
                    })
                })
            }

            if (pending.kind === "contacts" && info.averageItemLength > 0) {
                runContactsWhenReady(list => {
                    list.scrollToOffset({
                        offset: info.averageItemLength * info.index,
                        animated: false,
                    })
                })
            }

            retryPendingScroll()
        },
        [retryPendingScroll, runContactsWhenReady, runRecentWhenReady],
    )

    const scrollToAccount = useCallback(
        (address: string) => {
            const target = accountsSection.reduce<{
                sectionIndex: number
                itemIndex: number
            } | null>((found, section, sIdx) => {
                if (found) return found
                const iIdx = section.data.findIndex(acc => AddressUtils.compareAddresses(acc.address, address))
                return iIdx === -1 ? null : { sectionIndex: sIdx, itemIndex: iIdx }
            }, null)

            if (!target) return
            pendingScrollRef.current = {
                kind: "accounts",
                sectionIndex: target.sectionIndex,
                itemIndex: target.itemIndex,
                retries: 0,
            }

            setTimeout(() => {
                runAccountsWhenReady(list => {
                    list.scrollToLocation({
                        sectionIndex: target.sectionIndex,
                        itemIndex: target.itemIndex,
                        animated: true,
                        viewOffset: 24,
                    })
                })
            }, 100)
        },
        [accountsSection, runAccountsWhenReady],
    )

    const scrollToContact = useCallback(
        (address: string) => {
            const contactIndex = contacts.findIndex(contact => AddressUtils.compareAddresses(contact.address, address))
            if (contactIndex === -1) return
            pendingScrollRef.current = {
                kind: "contacts",
                index: contactIndex,
                retries: 0,
            }

            runContactsWhenReady(list => {
                list.scrollToIndex({
                    index: contactIndex,
                    animated: true,
                })
            })
        },
        [contacts, runContactsWhenReady],
    )

    const scrollToRecent = useCallback(
        (address: string) => {
            const recentIndex = recentContacts.findIndex(recent =>
                AddressUtils.compareAddresses(recent.address, address),
            )
            if (recentIndex === -1) return
            pendingScrollRef.current = {
                kind: "recent",
                index: recentIndex,
                retries: 0,
            }

            runRecentWhenReady(list => {
                list.scrollToIndex({
                    index: recentIndex,
                    animated: true,
                })
            })
        },
        [runRecentWhenReady, recentContacts],
    )

    useEffect(() => {
        if (!activeFilter || !realAddress) return
        setSelectedItem(activeFilter)

        if (activeFilter === "recent") scrollToRecent(realAddress)
        else if (activeFilter === "accounts") scrollToAccount(realAddress)
        else scrollToContact(realAddress)
    }, [activeFilter, realAddress, scrollToRecent, scrollToAccount, scrollToContact])

    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
        }
    }, [])

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
                    ref={setRecentsRef}
                    testID="Send_Receiver_Addresses_List_Recent_Contacts"
                    data={recentContacts}
                    extraData={{ context: "recent" }}
                    style={styles.list}
                    contentContainerStyle={styles.listContentContainer}
                    keyExtractor={item => item.address}
                    renderItem={({ item }) => renderItem({ item, context: "recent" })}
                    ItemSeparatorComponent={renderItemSeparator}
                    ListEmptyComponent={renderEmptyState}
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    showsVerticalScrollIndicator={false}
                    layout={LinearTransition.duration(500)}
                    windowSize={20}
                    initialNumToRender={20}
                    scrollEnabled={recentContacts.length > 0}
                />
            )}
            {selectedItem === "accounts" && (
                <AnimatedSectionList
                    ref={setAccountsRef}
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
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    layout={LinearTransition.duration(500)}
                    initialNumToRender={15}
                    windowSize={20}
                    scrollEnabled={accounts.length > 0}
                    stickySectionHeadersEnabled={false}
                    ListEmptyComponent={renderEmptyState}
                />
            )}
            {selectedItem === "contacts" && (
                <Animated.FlatList
                    ref={setContactsRef}
                    testID="Send_Receiver_Addresses_List_Contacts"
                    data={contacts}
                    extraData={{ context: "contacts" }}
                    style={styles.list}
                    contentContainerStyle={styles.listContentContainer}
                    keyExtractor={item => item.address}
                    renderItem={({ item }) => renderItem({ item, context: "contacts" })}
                    ItemSeparatorComponent={renderItemSeparator}
                    ListEmptyComponent={renderEmptyState}
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    showsVerticalScrollIndicator={false}
                    layout={LinearTransition.duration(500)}
                    windowSize={20}
                    initialNumToRender={20}
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
            flexGrow: 1,
            justifyContent: "space-between",
        },
        filterChip: {
            flex: 1,
        },
        list: { flexGrow: 1 },
        listContentContainer: { flexGrow: 1 },
    })
