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
        ref: refCreateContactBottomSheet,
        onOpen: openCreateContactSheet,
        onClose: closeCreateContactSheet,
    } = useBottomSheetModal()

    const accountsAndContacts = useMemo(() => {
        return [...accounts, ...contacts]
    }, [accounts, contacts])

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

    const onSuccessfullScan = useCallback(
        (address: string) => {
            setSelectedAddress(address)
            const addressExists = accountsAndContacts.some(accountOrContact =>
                AddressUtils.compareAddresses(
                    accountOrContact.address,
                    address,
                ),
            )
            if (addressExists) {
                nav.navigate(Routes.TRANSACTION_SUMMARY_SEND, {
                    token,
                    amount,
                    address,
                    initialRoute: initialRoute ?? "",
                })
            } else {
                openCreateContactSheet()
            }
        },
        [
            accountsAndContacts,
            amount,
            initialRoute,
            nav,
            openCreateContactSheet,
            token,
        ],
    )

    //Whenever search changes, we check if it's a valid address, eventually opening the create bottomsheet
    useEffect(() => {
        if (AddressUtils.isValid(searchText)) {
            setSelectedAddress(searchText)
        }
    }, [searchText, openCreateContactSheet])

    useEffect(() => {
        if (selectedAddress && !isAddressInContactsOrAccounts)
            openCreateContactSheet()
    }, [selectedAddress, isAddressInContactsOrAccounts, openCreateContactSheet])

    const onOpenCamera = () => {
        nav.navigate(Routes.CAMERA, { onScan: onSuccessfullScan })
    }

    const onTextReset = () => {
        setSearchText("")
        setErrorMessage("")
    }

    const goToResumeStep = () => {
        nav.navigate(Routes.TRANSACTION_SUMMARY_SEND, {
            token,
            amount,
            address: selectedAddress,
            initialRoute: initialRoute ?? "",
        })
    }

    const onNext = () => {
        if (isAddressInContactsOrAccounts) {
            goToResumeStep()
        } else {
            openCreateContactSheet()
        }
    }

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
                                searchText ? onTextReset : onOpenCamera
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
                            <BaseView>
                                {filteredContacts.map(contact => {
                                    const isSelected =
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
                            </BaseView>
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
                ref={refCreateContactBottomSheet}
                handleClose={closeCreateContactSheet}
                goToResumeStep={goToResumeStep}
                address={selectedAddress}
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
