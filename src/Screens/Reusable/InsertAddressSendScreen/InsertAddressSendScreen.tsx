import React, { useCallback, useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet, Keyboard } from "react-native"
import {
    useBottomSheetModal,
    useSearchContactsAndAccounts,
    useSearchOrScanInput,
} from "~Hooks"
import { AddressUtils } from "~Utils"
import {
    AccountCard,
    BaseAccordion,
    BaseSpacer,
    BaseText,
    BaseView,
    ContactCard,
    FadeoutButton,
    Layout,
    ScanBottomSheet,
} from "~Components"
import {
    RootStackParamListHome,
    RootStackParamListNFT,
    Routes,
} from "~Navigation"
import { useI18nContext } from "~i18n"
import { CreateContactBottomSheet } from "./Components/CreateContactBottomSheet/CreateContactBottomSheet"
import { ScanTarget } from "~Constants"

type Props = NativeStackScreenProps<
    RootStackParamListHome | RootStackParamListNFT,
    Routes.INSERT_ADDRESS_SEND
>

export const InsertAddressSendScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const [selectedAddress, setSelectedAddress] = useState("")
    const nav = useNavigation()

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

    const { BaseTextInputElement, searchText, setSearchText } =
        useSearchOrScanInput({
            openScanAddressSheet,
        })

    const {
        filteredContacts,
        filteredAccounts,
        isAddressInContactsOrAccounts,
        accountsAndContacts,
        contacts,
    } = useSearchContactsAndAccounts({ searchText, selectedAddress })

    const navigateNext = useCallback(
        (address: string) => {
            if (route.params.hasOwnProperty("token")) {
                const params =
                    route.params as RootStackParamListHome[Routes.INSERT_ADDRESS_SEND]

                nav.navigate(Routes.TRANSACTION_SUMMARY_SEND, {
                    token: params.token,
                    amount: params.amount,
                    address,
                    initialRoute: params.initialRoute ?? "",
                })
            } else {
                const params =
                    route.params as RootStackParamListNFT[Routes.INSERT_ADDRESS_SEND]

                nav.navigate(Routes.SEND_NFT_RECAP, {
                    contractAddress: params.contractAddress,
                    tokenId: params.tokenId,
                    receiverAddress: selectedAddress,
                })
            }
        },
        [route.params, nav, selectedAddress],
    )

    const onSuccessfullScan = useCallback(
        (address: string) => {
            const addressExists = accountsAndContacts.some(accountOrContact =>
                AddressUtils.compareAddresses(
                    accountOrContact.address,
                    address,
                ),
            )

            setSearchText(address)
            setSelectedAddress(address)
            if (addressExists) return navigateNext(address)
        },
        [accountsAndContacts, navigateNext, setSearchText],
    )

    //Whenever search changes, we check if it's a valid address
    useEffect(() => {
        if (searchText && AddressUtils.isValid(searchText)) {
            setSelectedAddress(searchText)
            Keyboard.dismiss()
        }
    }, [searchText, isAddressInContactsOrAccounts, openCreateContactSheet])

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
        <Layout
            safeAreaTestID="Insert_Address_Send_Screen"
            title={LL.BTN_SEND()}
            fixedHeader={
                <BaseView>
                    <BaseText typographyFont="body">
                        {LL.SEND_INSERT_ADDRESS_DESCRIPTION()}
                    </BaseText>
                    <BaseSpacer height={24} />
                    <BaseView flexDirection="row" w={100}>
                        {BaseTextInputElement}
                    </BaseView>
                </BaseView>
            }
            body={
                <BaseView mb={80}>
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
            }
            footer={
                <>
                    <FadeoutButton
                        title={LL.COMMON_BTN_NEXT()}
                        action={onNext}
                        disabled={!selectedAddress}
                        bottom={0}
                        mx={0}
                        width={"auto"}
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
                </>
            }
        />
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
