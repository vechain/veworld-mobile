import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ScrollView, StyleSheet, Keyboard } from "react-native"
import { Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListNFT } from "~Navigation/Stacks/NFTStack"
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
import { useI18nContext } from "~i18n"
import { AddressUtils } from "~Utils"
import {
    BottomInsetsEXtraPadding,
    useBottomSheetModal,
    usePlatformBottomInsets,
} from "~Hooks"
import { ScanTarget } from "~Constants"
import {
    selectAccounts,
    selectKnownContacts,
    useAppSelector,
} from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { CreateContactBottomSheet } from "../../SendScreen/03-InsertAddressSendScreen/Components"

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.SEND_NFT>

export const SendNFTScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/763) refactor to a new hook
    const accounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectKnownContacts)
    const accountsAndContacts = useMemo(() => {
        return [...accounts, ...contacts]
    }, [accounts, contacts])

    const { calculateBottomInsets } = usePlatformBottomInsets(
        BottomInsetsEXtraPadding.StaticButton,
    )

    const [errorMessage, setErrorMessage] = useState("")
    const [selectedAddress, setSelectedAddress] = useState("")

    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    const {
        ref: createContactBottomSheetRef,
        onOpen: openCreateContactSheet,
        onClose: closeCreateContactSheet,
    } = useBottomSheetModal()

    const isAddressInContactsOrAccounts = useMemo(() => {
        if (!selectedAddress) return false
        return accountsAndContacts.some(accountOrContact =>
            AddressUtils.compareAddresses(
                accountOrContact.address,
                selectedAddress,
            ),
        )
    }, [accountsAndContacts, selectedAddress])

    useEffect(() => {
        if (selectedAddress) {
            if (AddressUtils.isValid(selectedAddress)) {
                setErrorMessage("")
                if (!isAddressInContactsOrAccounts) {
                    Keyboard.dismiss()
                    openCreateContactSheet()
                }
            } else {
                setErrorMessage(LL.ERROR_INVALID_ADDRESS())
            }
        } else {
            setErrorMessage("")
        }
    }, [
        LL,
        isAddressInContactsOrAccounts,
        openCreateContactSheet,
        selectedAddress,
    ])

    const onIconPress = useCallback(() => {
        // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/764) test camera
        openScanAddressSheet()
    }, [openScanAddressSheet])

    const onScan = useCallback(
        (uri: string) => {
            if (AddressUtils.isValid(uri)) {
                setSelectedAddress(uri)
            } else {
                setErrorMessage(LL.ERROR_INVALID_ADDRESS())
            }
        },
        [LL],
    )

    const navigateNext = useCallback(() => {
        const { contractAddress, tokenId } = route.params

        if (contractAddress && tokenId && selectedAddress) {
            nav.navigate(Routes.SEND_NFT_RECAP, {
                contractAddress: route.params.contractAddress,
                tokenId: route.params.tokenId,
                receiverAddress: selectedAddress,
            })
        }
    }, [route.params, selectedAddress, nav])

    const onNext = useCallback(() => {
        if (isAddressInContactsOrAccounts && selectedAddress) {
            navigateNext()
        } else {
            Keyboard.dismiss()
            openCreateContactSheet()
        }
    }, [
        isAddressInContactsOrAccounts,
        navigateNext,
        openCreateContactSheet,
        selectedAddress,
    ])

    return (
        <>
            <BaseSafeArea grow={1}>
                <BackButtonHeader />

                <ScrollView
                    contentContainerStyle={{
                        paddingBottom: calculateBottomInsets,
                    }}>
                    <BaseView mx={20}>
                        <BaseText typographyFont="title">
                            {LL.BTN_SEND()}
                        </BaseText>
                        <BaseSpacer height={24} />

                        <BaseText my={8} typographyFont="button">
                            {LL.SEND_NFT_TITLE()}
                        </BaseText>

                        <BaseText>{LL.SEND_NFT_SUB_TITLE()}</BaseText>

                        <BaseSpacer height={32} />

                        <BaseTextInput
                            rightIcon="qrcode-scan"
                            onIconPress={onIconPress}
                            placeholder={"Add an address"}
                            value={selectedAddress}
                            setValue={setSelectedAddress}
                            errorMessage={errorMessage}
                        />

                        <BaseAccordion
                            defaultIsOpen={!!contacts.length}
                            headerComponent={
                                <BaseView flexDirection="row">
                                    <BaseText typographyFont="bodyBold">
                                        {LL.SEND_INSERT_CONTACTS()} (
                                        {contacts.length})
                                    </BaseText>
                                </BaseView>
                            }
                            bodyComponent={
                                <>
                                    {contacts.map(contact => {
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
                            headerComponent={
                                <BaseView flexDirection="row">
                                    <BaseText typographyFont="bodyBold">
                                        {LL.SEND_INSERT_ACCOUNTS()} (
                                        {accounts.length})
                                    </BaseText>
                                </BaseView>
                            }
                            // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/765) fix accordions with dynamic content
                            bodyComponent={
                                <BaseView>
                                    {accounts.map(account => {
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
                    onScan={onScan}
                    target={ScanTarget.WALLET_CONNECT}
                />
            </BaseSafeArea>
        </>
    )
}

const baseStyles = StyleSheet.create({
    accountCard: { marginVertical: 5, height: 74 },
    contactCard: { marginVertical: 5, height: 62 },
    nextButton: { marginBottom: 70 },
})
