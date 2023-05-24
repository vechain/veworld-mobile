/* eslint-disable react-native/no-inline-styles */
import React, { memo, useCallback, useMemo, useState } from "react"
import { FlatList, StyleSheet, ViewToken } from "react-native"
import DropShadow from "react-native-drop-shadow"
import {
    ColorThemeType,
    FormattingUtils,
    SCREEN_WIDTH,
    useThemedStyles,
} from "~Common"
import { COLORS } from "~Common/Theme"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    PaginatedDot,
    PicassoAddressIcon,
} from "~Components"
import { Contact, WalletAccount } from "~Model"
import {
    selectContactByAddress,
    selectContactsByAddresses,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { address } from "thor-devkit"

type Props = {
    fromAddress: string
    toAddresses?: Array<string>
    onAddContactPress?: (address: string) => void
}

enum PROVENANCE {
    FROM = "FROM",
    TO = "TO",
}

export const TransferCard = memo(
    ({ fromAddress, toAddresses, onAddContactPress }: Props) => {
        const { LL } = useI18nContext()

        const { styles, theme } = useThemedStyles(baseStyles)

        const accounts = useAppSelector(selectVisibleAccounts)

        const fromContact = useAppSelector(
            selectContactByAddress(address.toChecksumed(fromAddress)),
        )

        const toContacts = useAppSelector(
            selectContactsByAddresses(toAddresses?.map(address.toChecksumed)),
        )

        const [activeIndex, setActiveIndex] = useState(0)

        const fromContactName = useMemo(() => {
            if (fromContact) return fromContact.alias

            const account = accounts.find(
                (acc: WalletAccount) =>
                    acc.address.toLowerCase() === fromAddress.toLowerCase(),
            )

            if (account) return account.alias

            return undefined
        }, [accounts, fromAddress, fromContact])

        // For each "toAddress" we need to find the contact or the account name if it exists
        const toContactNames = useMemo(() => {
            const names: Array<string | undefined> = []

            toAddresses?.map((_address: string) => {
                const contactFound = toContacts.find(
                    (contact: Contact) =>
                        contact.address.toLowerCase() ===
                        _address.toLowerCase(),
                )
                if (contactFound) {
                    names.push(contactFound.alias)
                } else {
                    const account = accounts.find(
                        (acc: WalletAccount) =>
                            acc.address.toLowerCase() ===
                            _address.toLowerCase(),
                    )

                    account ? names.push(account.alias) : names.push(undefined)
                }
            })

            return names
        }, [accounts, toAddresses, toContacts])

        const fromAddressShort = useMemo(() => {
            return FormattingUtils.humanAddress(fromAddress, 4, 6)
        }, [fromAddress])

        const toAddressesShort = useMemo(() => {
            const shortenedAddresses: Array<string> = []
            toAddresses?.map((_address: string) => {
                shortenedAddresses.push(
                    FormattingUtils.humanAddress(_address, 4, 6),
                )
            })

            return shortenedAddresses
        }, [toAddresses])

        const renderAccount = useCallback(
            (
                provenance: PROVENANCE,
                _address: string,
                addressShort: string,
                contactName?: string,
            ) => {
                const provenanceText =
                    provenance === PROVENANCE.FROM ? LL.FROM() : LL.TO()
                return (
                    <BaseView
                        py={12}
                        px={16}
                        key={_address}
                        style={{ width: SCREEN_WIDTH - 40 }}
                        alignItems="flex-start">
                        <BaseText typographyFont="buttonPrimary">
                            {provenanceText}
                        </BaseText>
                        <BaseView flexDirection="row" py={8}>
                            <PicassoAddressIcon address={_address} size={40} />
                            <BaseView flexDirection="column" pl={12}>
                                {contactName && (
                                    <BaseText typographyFont="subSubTitle">
                                        {contactName}
                                    </BaseText>
                                )}
                                <BaseText
                                    typographyFont={
                                        contactName
                                            ? "captionRegular"
                                            : "button"
                                    }
                                    pt={3}>
                                    {addressShort}
                                </BaseText>
                            </BaseView>
                            {!contactName && (
                                <BaseView pl={12}>
                                    <BaseIcon
                                        name={"account-plus-outline"}
                                        size={20}
                                        bg={COLORS.LIME_GREEN}
                                        iconPadding={3}
                                        color={COLORS.DARK_PURPLE}
                                        action={
                                            onAddContactPress
                                                ? () =>
                                                      onAddContactPress(
                                                          _address,
                                                      )
                                                : undefined
                                        }
                                    />
                                </BaseView>
                            )}
                        </BaseView>
                    </BaseView>
                )
            },
            [LL, onAddContactPress],
        )

        const renderFromAccount = useCallback(() => {
            const _address = fromAddress
            const addressShort = fromAddressShort
            const contactName = fromContactName

            return renderAccount(
                PROVENANCE.FROM,
                _address,
                addressShort,
                contactName,
            )
        }, [fromAddress, fromAddressShort, fromContactName, renderAccount])

        const renderToAccount = useCallback(
            ({ index }: { index: number }) => {
                const addressShort = toAddressesShort[index]
                const contactName = toContactNames[index]
                const _address = toAddresses![index]

                return renderAccount(
                    PROVENANCE.TO,
                    _address,
                    addressShort,
                    contactName,
                )
            },
            [renderAccount, toAddresses, toAddressesShort, toContactNames],
        )

        const onViewableItemsChanged = useCallback(
            ({ viewableItems }: { viewableItems: ViewToken[] }) => {
                const activeIdx = viewableItems[0].index

                setActiveIndex(activeIdx ?? 0)
            },
            [],
        )

        return (
            <DropShadow style={[theme.shadows.card, styles.container]}>
                <BaseView bg={theme.colors.card} style={styles.view}>
                    {/* FROM View */}
                    {renderFromAccount()}

                    {/* TO View */}
                    {toAddresses && (
                        <>
                            {/* SEPARATOR */}
                            <BaseView style={styles.separator} />
                            <FlatList
                                data={toAddresses}
                                renderItem={renderToAccount}
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
                                        style={[
                                            styles.icon,
                                            { marginTop: -35 },
                                        ]}
                                        name={"arrow-down"}
                                        color={COLORS.WHITE}
                                        size={24}
                                        bg={theme.colors.switcher}
                                        iconPadding={3}
                                    />
                                    <BaseView alignItems="center" w={100}>
                                        <PaginatedDot
                                            activeDotColor={
                                                theme.colors.primary
                                            }
                                            inactiveDotColor={
                                                theme.colors.primary
                                            }
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
                                        style={[
                                            styles.icon,
                                            { marginTop: -20 },
                                        ]}
                                        name={"arrow-down"}
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
            </DropShadow>
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
