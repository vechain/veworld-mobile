import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ScrollView, StyleSheet, Keyboard } from "react-native"
import {
    BottomInsetsEXtraPadding,
    useBottomSheetModal,
    usePlatformBottomInsets,
} from "~Hooks"
import { AddressUtils } from "~Utils"
import {
    AccountCard,
    BackButtonHeader,
    BaseAccordion,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
    ContactCard,
    FadeoutButton,
    ScanBottomSheet,
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
import { ScanTarget } from "~Constants"

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

    const { calculateBottomInsets } = usePlatformBottomInsets(
        BottomInsetsEXtraPadding.StaticButton,
    )

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

    // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/763) refactor to a new hook
    const accounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectKnownContacts)
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
            Keyboard.dismiss()
            openCreateContactSheet()
        },
        [accountsAndContacts, openCreateContactSheet, navigateNext],
    )

    //Whenever search changes, we check if it's a valid address,
    // eventually opening the create contact bottomsheet if needed
    useEffect(() => {
        if (searchText && AddressUtils.isValid(searchText)) {
            setSelectedAddress(searchText)
            if (!isAddressInContactsOrAccounts) {
                Keyboard.dismiss()
                openCreateContactSheet()
            }
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
            Keyboard.dismiss()
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
            <ScrollView
                contentContainerStyle={{
                    paddingBottom: calculateBottomInsets,
                }}>
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
                            containerStyle={baseStyles.inputContainer}
                            value={searchText}
                            setValue={handleSearchChange}
                            placeholder={LL.SEND_ENTER_AN_ADDRESS()}
                            errorMessage={errorMessage}
                            testID="InsertAddressSendScreen_addressInput"
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
                                            containerStyle={
                                                baseStyles.contactCard
                                            }
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
                                            containerStyle={
                                                baseStyles.accountCard
                                            }
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
            </ScrollView>

            <FadeoutButton
                title={LL.COMMON_BTN_NEXT()}
                action={onNext}
                disabled={!selectedAddress}
            />

            <CreateContactBottomSheet
                ref={createContactBottomSheetRef}
                onClose={closeCreateContactSheet}
                onSubmit={navigateNext}
                address={selectedAddress}
            />

            <ScanBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={onSuccessfullScan}
                target={ScanTarget.ADDRESS}
            />
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
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
