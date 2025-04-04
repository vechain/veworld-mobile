/* eslint-disable react-native/no-inline-styles */
import React, { memo, useCallback, useMemo, useState } from "react"
import { FlatList, StyleSheet, ViewToken } from "react-native"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    LedgerBadge,
    PaginatedDot,
    PicassoAddressIcon,
    WatchedAccountBadge,
} from "~Components"
import { COLORS, ColorThemeType, SCREEN_WIDTH } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { Contact, WalletAccount } from "~Model"
import {
    selectContactByAddress,
    selectContactsByAddresses,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { useI18nContext } from "~i18n"

type Props = {
    fromAddress: string
    toAddresses?: Array<string>
    onAddContactPress?: (address: string) => void
    isFromAccountLedger?: boolean
    isToAccountLedger?: boolean
    isObservedWallet?: boolean
}

enum PROVENANCE {
    FROM = "FROM",
    TO = "TO",
}

export const TransferCard = memo(
    ({
        fromAddress,
        toAddresses,
        onAddContactPress,
        isFromAccountLedger,
        isToAccountLedger,
        isObservedWallet,
    }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const accounts = useAppSelector(selectVisibleAccounts)
        const fromContact = useAppSelector(state => selectContactByAddress(state, fromAddress))
        const toContacts = useAppSelector(state => selectContactsByAddresses(state, toAddresses))
        const [activeIndex, setActiveIndex] = useState(0)
        const isDeployContract = toAddresses?.[0] === ""

        const fromAddressVns = useVns({
            name: "",
            address: fromAddress,
        })

        const fromContactName = useMemo(() => {
            if (fromContact) return fromContact.alias

            const account = accounts.find(
                (acc: WalletAccount) => acc.address.toLowerCase() === fromAddress.toLowerCase(),
            )

            if (account) return account.alias

            return undefined
        }, [accounts, fromAddress, fromContact])

        // For each "toAddress" we need to find the contact or the account name if it exists
        const toContactNames = useMemo(() => {
            const names: Array<string | undefined> = []

            toAddresses?.map((_address: string) => {
                const contactFound = toContacts.find(
                    (contact: Contact) => contact.address.toLowerCase() === _address.toLowerCase(),
                )
                if (contactFound) {
                    names.push(contactFound.alias)
                } else {
                    const account = accounts.find(
                        (acc: WalletAccount) => acc.address.toLowerCase() === _address.toLowerCase(),
                    )

                    account ? names.push(account.alias) : names.push(undefined)
                }
            })

            return names
        }, [accounts, toAddresses, toContacts])

        const toAddressesShort = useMemo(() => {
            const shortenedAddresses: Array<string> = []
            toAddresses?.map((_address: string) => {
                shortenedAddresses.push(AddressUtils.humanAddress(_address))
            })

            return shortenedAddresses
        }, [toAddresses])

        const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
            const activeIdx = viewableItems[0].index

            setActiveIndex(activeIdx ?? 0)
        }, [])

        const nameOrAddressFrom = AddressUtils.showAddressOrName(fromAddress, fromAddressVns, {
            ellipsed: true,
            lengthBefore: 4,
            lengthAfter: 6,
        })

        return (
            <BaseView style={[styles.container]}>
                <BaseView bg={theme.colors.card} style={styles.view}>
                    {/* FROM View */}
                    <FromAccounCard
                        fromContactName={fromContactName}
                        fromAddress={fromAddress}
                        isFromAccountLedger={isFromAccountLedger}
                        onAddContactPress={onAddContactPress}
                        vnsName={nameOrAddressFrom}
                    />

                    {/* TO View */}
                    {toAddresses && !isDeployContract && (
                        <>
                            {/* SEPARATOR */}
                            <BaseView style={styles.separator} />

                            <FlatList
                                data={toAddresses}
                                renderItem={({ index }) => (
                                    <ToAccountCard
                                        toAddressesShort={toAddressesShort[index]}
                                        toContactNames={toContactNames[index]}
                                        toAddresses={toAddresses![index]}
                                        isToAccountLedger={isToAccountLedger}
                                        isObservedWallet={isObservedWallet}
                                    />
                                )}
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                horizontal
                                pagingEnabled
                                snapToAlignment="start"
                                keyExtractor={item => item}
                                onViewableItemsChanged={onViewableItemsChanged}
                                scrollEnabled={toAddresses.length > 1}
                            />

                            {toAddresses.length > 1 && (
                                <>
                                    <BaseIcon
                                        style={[styles.icon, { marginTop: -35 }]}
                                        name={"icon-arrow-down"}
                                        color={COLORS.WHITE}
                                        size={24}
                                        bg={theme.colors.switcher}
                                        iconPadding={3}
                                    />
                                    <BaseView alignItems="center" w={100}>
                                        <PaginatedDot
                                            activeDotColor={theme.colors.primary}
                                            inactiveDotColor={theme.colors.primary}
                                            pageIdx={activeIndex}
                                            maxPage={toAddresses.length}
                                        />
                                    </BaseView>
                                    <BaseSpacer height={16} />
                                </>
                            )}
                            {toAddresses.length === 1 && (
                                <>
                                    <BaseIcon
                                        style={[styles.icon, { marginTop: -20 }]}
                                        name={"icon-arrow-down"}
                                        color={COLORS.WHITE}
                                        size={24}
                                        bg={theme.colors.switcher}
                                        iconPadding={3}
                                    />
                                </>
                            )}
                        </>
                    )}
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
        },
        view: {
            borderRadius: 16,
        },
        separator: {
            width: "100%",
            borderWidth: 1,
            borderColor: theme.colors.background,
        },
        icon: {
            position: "absolute",
            top: "50%",
            right: 20,
        },
    })

const FromAccounCard = ({
    fromContactName,
    fromAddress,
    isFromAccountLedger,
    onAddContactPress,
    _isObservedWallet,
    vnsName,
}: {
    fromContactName: string | undefined
    fromAddress: string
    vnsName?: string
    isFromAccountLedger?: boolean
    onAddContactPress?: (address: string) => void
    _isObservedWallet?: boolean
}) => {
    const _address = fromAddress
    const contactName = fromContactName

    return (
        <AccountCard
            provenance={PROVENANCE.FROM}
            _address={_address}
            contactName={contactName}
            isLedger={isFromAccountLedger}
            _isObservedWallet={_isObservedWallet}
            onAddContactPress={onAddContactPress}
            vnsName={vnsName}
        />
    )
}

const ToAccountCard = ({
    toContactNames,
    toAddresses,
    isToAccountLedger,
    isObservedWallet,
    onAddContactPress,
}: {
    toAddressesShort: string
    toAddresses: string
    toContactNames?: string
    isToAccountLedger?: boolean
    isObservedWallet?: boolean
    onAddContactPress?: (address: string) => void
}) => {
    const toAddressVns = useVns({
        name: "",
        address: toAddresses,
    })

    const nameOrAddressTo = AddressUtils.showAddressOrName(toAddresses, toAddressVns, {
        ellipsed: true,
        lengthBefore: 4,
        lengthAfter: 6,
    })

    return (
        <AccountCard
            provenance={PROVENANCE.TO}
            _address={toAddresses}
            contactName={toContactNames}
            isLedger={isToAccountLedger}
            _isObservedWallet={isObservedWallet}
            onAddContactPress={onAddContactPress}
            vnsName={nameOrAddressTo}
        />
    )
}

const AccountCard = ({
    provenance,
    _address,
    contactName,
    isLedger,
    _isObservedWallet,
    onAddContactPress,
    vnsName,
}: {
    provenance: PROVENANCE
    _address: string
    vnsName?: string
    contactName?: string
    isLedger?: boolean
    _isObservedWallet?: boolean
    onAddContactPress?: (address: string) => void
}) => {
    const { LL } = useI18nContext()
    const provenanceText = provenance === PROVENANCE.FROM ? LL.FROM() : LL.TO()

    return (
        <BaseView py={12} px={16} key={_address} style={{ width: SCREEN_WIDTH - 40 }} alignItems="flex-start">
            <BaseText typographyFont="buttonPrimary">{provenanceText}</BaseText>
            <BaseView flexDirection="row" py={8}>
                <PicassoAddressIcon address={_address} size={40} />
                <BaseView flexDirection="column" pl={12}>
                    {contactName && <BaseText typographyFont="subSubTitle">{contactName}</BaseText>}
                    <BaseView flexDirection="row" mt={3}>
                        {isLedger && (
                            <>
                                <LedgerBadge />
                                <BaseSpacer width={8} />
                            </>
                        )}
                        {_isObservedWallet && (
                            <>
                                <WatchedAccountBadge />
                                <BaseSpacer width={8} />
                            </>
                        )}
                        <BaseText typographyFont={contactName ? "captionRegular" : "button"}>{vnsName}</BaseText>
                    </BaseView>
                </BaseView>
                {!contactName && onAddContactPress && (
                    <BaseView pl={12}>
                        <BaseIcon
                            haptics="Light"
                            name={"icon-user-plus"}
                            size={20}
                            bg={COLORS.LIME_GREEN}
                            iconPadding={3}
                            color={COLORS.DARK_PURPLE}
                            action={() => onAddContactPress(_address)}
                        />
                    </BaseView>
                )}
            </BaseView>
        </BaseView>
    )
}
