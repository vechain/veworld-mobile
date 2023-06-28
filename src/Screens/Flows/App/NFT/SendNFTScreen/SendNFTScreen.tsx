import React, { useCallback, useEffect, useState } from "react"
import { ScrollView, StyleSheet } from "react-native"
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
import { useBottomSheetModal, usePlatformBottomInsets } from "~Hooks"
import { ScanTarget } from "~Constants"
import {
    selectAccounts,
    selectKnownContacts,
    useAppSelector,
} from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"

type Props = NativeStackScreenProps<RootStackParamListNFT, Routes.SEND_NFT>

export const SendNFTScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const accounts = useAppSelector(selectAccounts)
    const contacts = useAppSelector(selectKnownContacts)

    const { calculateBottomInsets } = usePlatformBottomInsets("hasStaticButton")

    const [errorMessage, setErrorMessage] = useState("")
    const [selectedAddress, setSelectedAddress] = useState("")

    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    useEffect(() => {
        if (selectedAddress) {
            if (AddressUtils.isValid(selectedAddress)) {
                setErrorMessage("")
            } else {
                setErrorMessage(LL.ERROR_INVALID_ADDRESS())
            }
        } else {
            setErrorMessage("")
        }
    }, [LL, selectedAddress])

    const onIconPress = useCallback(() => {
        // Todo. test camera
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

    const onNext = useCallback(() => {
        const { contractAddress, tokenId } = route.params
        if (contractAddress && tokenId && selectedAddress) {
            nav.navigate(Routes.SEND_NFT_RECAP, {
                contractAddress: route.params.contractAddress,
                tokenId: route.params.tokenId,
                receiverAddress: selectedAddress,
            })
        }
    }, [nav, route.params, selectedAddress])

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
                            /*TODO: fix accordions with dynamic content */
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
