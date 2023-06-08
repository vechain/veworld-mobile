import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"
import { useBottomSheetModal } from "~Common"
import { AddressUtils } from "~Utils"
import {
    AccountCard,
    BackButtonHeader,
    BaseAccordion,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    ContactCard,
    ScanAddressBottomSheet,
    ScrollViewWithFooter,
} from "~Components"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
import {
    selectAccounts,
    selectKnownContacts,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { CreateContactBottomSheet } from "./Components/CreateContactBottomSheet/CreateContactBottomSheet"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.INSERT_ADDRESS_SEND
>

export const InsertAddressSendScreen = ({ route }: Props) => {
    const { token, amount, initialRoute } = route.params
    const { LL } = useI18nContext()
    const [searchText, setSearchText] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [selectedAddress, setSelectedAddress] = useState("")
    const nav = useNavigation()
    const accounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectKnownContacts)

    const {
        ref: createContactBottomSheetRef,
        onOpen: openCreateContactSheet,
        onClose: closeCreateContactSheet,
    } = useBottomSheetModal()

    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    const accountsAndContacts = useMemo(() => {
        return [...accounts, ...contacts]
    }, [accounts, contacts])

    //We filter the accounts and contacts based on the search text and the selected address
    const filteredContacts = useMemo(() => {
        if (!searchText) return contacts
        return contacts.filter(
            contact =>
                (!!selectedAddress &&
                    compareAddresses(contact.address, selectedAddress)) ||
                contact.alias
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                contact.address
                    .toLowerCase()
                    .includes(searchText.toLowerCase()),
        )
    }, [selectedAddress, contacts, searchText])

    const filteredAccounts = useMemo(() => {
        if (!searchText) return accounts
        return accounts.filter(
            account =>
                (!!selectedAddress &&
                    compareAddresses(account.address, selectedAddress)) ||
                account.alias
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                account.address
                    .toLowerCase()
                    .includes(searchText.toLowerCase()),
        )
    }, [selectedAddress, accounts, searchText])

    const isAddressInContactsOrAccounts = useMemo(() => {
        if (!selectedAddress) return false
        return accountsAndContacts.some(accountOrContact =>
            AddressUtils.compareAddresses(
                accountOrContact.address,
                selectedAddress,
            ),
        )
    }, [accountsAndContacts, selectedAddress])

    const handleSearchChange = useCallback((text: string) => {
        const lowerCaseText = text.toLowerCase()
        setErrorMessage("")
        setSearchText(lowerCaseText)
    }, [])

    const navigateNext = useCallback(
        (address: string) => {
            nav.navigate(Routes.TRANSACTION_SUMMARY_SEND, {
                token,
                amount,
                address,
                initialRoute: initialRoute ?? "",
            })
        },
        [nav, token, amount, initialRoute],
    )

    const onSuccessfullScan = useCallback(
        (address: string) => {
            const addressExists = accountsAndContacts.some(accountOrContact =>
                AddressUtils.compareAddresses(
                    accountOrContact.address,
                    address,
                ),
            )
            if (addressExists) return navigateNext(address)

            setSelectedAddress(address)
            openCreateContactSheet()
        },
        [accountsAndContacts, openCreateContactSheet, navigateNext],
    )

    //Whenever search changes, we check if it's a valid address,
    // eventually opening the create contact bottomsheet if needed
    useEffect(() => {
        if (searchText && AddressUtils.isValid(searchText)) {
            setSelectedAddress(searchText)
            if (!isAddressInContactsOrAccounts) openCreateContactSheet()
        }
    }, [searchText, isAddressInContactsOrAccounts, openCreateContactSheet])

    const onTextReset = () => {
        setSearchText("")
        setErrorMessage("")
    }

    const onNext = useCallback(() => {
        if (isAddressInContactsOrAccounts && selectedAddress) {
            navigateNext(selectedAddress)
        } else {
            openCreateContactSheet()
        }
    }, [
        isAddressInContactsOrAccounts,
        selectedAddress,
        navigateNext,
        openCreateContactSheet,
    ])

    return (
        <BaseSafeArea grow={1} testID="Insert_Address_Send_Screen">
            <BackButtonHeader />
            <ScrollViewWithFooter
                footer={
                    <>
                        <BaseButton
                            style={styles.nextButton}
                            mx={24}
                            title={LL.COMMON_BTN_NEXT()}
                            disabled={!selectedAddress}
                            action={onNext}
                        />
                        <BaseSpacer height={96} />
                    </>
                }>
                <BaseView mx={24}>
                    <BaseText typographyFont="title">
                        {LL.SEND_TOKEN_TITLE()}
                    </BaseText>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="button">
                        {LL.SEND_INSERT_ADDRESS()}
                    </BaseText>
                    <BaseSpacer height={8} />
                    <BaseText typographyFont="body">
                        {LL.SEND_INSERT_ADDRESS_DESCRIPTION()}
                    </BaseText>
                    <BaseSpacer height={24} />
                    <BaseView flexDirection="row" w={100}>
                        <BaseTextInput
                            containerStyle={styles.inputContainer}
                            value={searchText}
                            setValue={handleSearchChange}
                            placeholder={LL.SEND_ENTER_AN_ADDRESS()}
                            errorMessage={errorMessage}
                            rightIcon={searchText ? "close" : "flip-horizontal"}
                            onIconPress={
                                searchText ? onTextReset : openScanAddressSheet
                            }
                        />
                    </BaseView>
                </BaseView>
                <BaseView mx={24}>
                    <BaseAccordion
                        defaultIsOpen={!!contacts.length}
                        headerComponent={
                            <BaseView flexDirection="row">
                                <BaseText>
                                    {LL.SEND_INSERT_CONTACTS()} (
                                    {filteredContacts.length})
                                </BaseText>
                            </BaseView>
                        }
                        bodyComponent={
                            <>
                                {filteredContacts.map(contact => {
                                    const isSelected =
                                        !!selectedAddress &&
                                        AddressUtils.compareAddresses(
                                            contact.address,
                                            selectedAddress,
                                        )
                                    const onPress = () =>
                                        setSelectedAddress(contact.address)

                                    return (
                                        <ContactCard
                                            key={contact.address}
                                            containerStyle={styles.contactCard}
                                            contact={contact}
                                            onPress={onPress}
                                            selected={isSelected}
                                        />
                                    )
                                })}
                            </>
                        }
                    />
                    <BaseAccordion
                        defaultIsOpen
                        headerComponent={
                            <BaseView flexDirection="row">
                                <BaseText>
                                    {LL.SEND_INSERT_ACCOUNTS()} (
                                    {filteredAccounts.length})
                                </BaseText>
                            </BaseView>
                        }
                        /*TODO: fix accordions with dynamic content */
                        bodyComponent={
                            <BaseView>
                                {filteredAccounts.map(account => {
                                    const isSelected =
                                        !!selectedAddress &&
                                        AddressUtils.compareAddresses(
                                            account.address,
                                            selectedAddress,
                                        )
                                    const onPress = () =>
                                        setSelectedAddress(account.address)
                                    return (
                                        <AccountCard
                                            key={account.address}
                                            containerStyle={styles.accountCard}
                                            account={account}
                                            onPress={onPress}
                                            selected={isSelected}
                                        />
                                    )
                                })}
                            </BaseView>
                        }
                    />
                </BaseView>
            </ScrollViewWithFooter>
            <CreateContactBottomSheet
                ref={createContactBottomSheetRef}
                onClose={closeCreateContactSheet}
                onSubmit={navigateNext}
                address={selectedAddress}
            />
            <ScanAddressBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onSuccessfullScan}
            />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    icon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    inputContainer: {
        width: "100%",
    },
    nextButton: {
        marginBottom: 70,
    },
    accountCard: { marginVertical: 5, height: 74 },
    contactCard: { marginVertical: 5, height: 62 },
})
