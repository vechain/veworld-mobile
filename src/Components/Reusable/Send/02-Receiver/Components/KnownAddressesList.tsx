import React, { useCallback, useMemo, useState } from "react"
import { SectionList, StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { BaseSpacer } from "~Components/Base"
import { GenericAccountCard } from "~Components/Reusable/AccountCard"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import {
    selectAccounts,
    selectCachedContacts,
    selectKnownContacts,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import AddressUtils from "~Utils/AddressUtils"
import { AnimatedFilterChips } from "../../../AnimatedFilterChips"
import { AccountWithDevice, Contact } from "~Model"

type FilterItem = "recent" | "accounts" | "contacts"

const FILTER_ITEMS: FilterItem[] = ["recent", "accounts", "contacts"]

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)

export const KnownAddressesList = () => {
    const [selectedItem, setSelectedItem] = useState<FilterItem>("recent")
    const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined)

    const currentAccount = useAppSelector(selectSelectedAccount)
    const allAccounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectKnownContacts)
    const unknownContacts = useAppSelector(selectCachedContacts)

    const accounts = useMemo(() => {
        return allAccounts.filter(account => AddressUtils.compareAddresses(account.address, currentAccount.address))
    }, [allAccounts, currentAccount.address])

    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

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

    const renderItemSeparator = useCallback(() => <BaseSpacer height={8} />, [])

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
                    keyExtractor={item => item.address}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderItemSeparator}
                />
            )}
            {selectedItem === "accounts" && (
                <Animated.FlatList
                    data={accounts}
                    keyExtractor={item => item.address}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderItemSeparator}
                />
            )}
            {selectedItem === "contacts" && (
                <Animated.FlatList
                    data={contacts}
                    keyExtractor={item => item.address}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderItemSeparator}
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
    })
