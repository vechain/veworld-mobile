import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet, Keyboard } from "react-native"
import { useBottomSheetModal, useSearchOrScanInput, useTheme, useVns, ZERO_ADDRESS } from "~Hooks"
import { AddressUtils } from "~Utils"
import {
    AccountCard,
    BaseAccordion,
    BaseSkeleton,
    BaseSpacer,
    BaseText,
    BaseView,
    ContactCard,
    FadeoutButton,
    Layout,
    showWarningToast,
} from "~Components"
import { RootStackParamListHome, RootStackParamListNFT, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { CreateContactBottomSheet } from "./Components"
import { address as addressThor } from "thor-devkit"

type Props = NativeStackScreenProps<RootStackParamListHome | RootStackParamListNFT, Routes.INSERT_ADDRESS_SEND>

const CONTACT_CARD_DEFAULT_HIGHT = 73
const ACCOUNT_CARD_DEFAULT_HIGHT = 86

export const InsertAddressSendScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const [selectedAddress, setSelectedAddress] = useState("")
    const nav = useNavigation()
    const theme = useTheme()

    const {
        ref: createContactBottomSheetRef,
        onOpen: openCreateContactSheet,
        onClose: closeCreateContactSheet,
    } = useBottomSheetModal()

    const navigateNext = useCallback(
        (address: string) => {
            if (
                (
                    route.params as
                        | RootStackParamListHome[Routes.INSERT_ADDRESS_SEND]
                        | RootStackParamListNFT[Routes.INSERT_ADDRESS_SEND]
                ).hasOwnProperty("token")
            ) {
                const params = route.params as RootStackParamListHome[Routes.INSERT_ADDRESS_SEND]

                nav.navigate(Routes.TRANSACTION_SUMMARY_SEND, {
                    token: params.token!,
                    amount: params.amount!,
                    address,
                })
            } else {
                const params = route.params as RootStackParamListNFT[Routes.INSERT_ADDRESS_SEND]

                nav.navigate(Routes.SEND_NFT_RECAP, {
                    contractAddress: params.contractAddress!,
                    tokenId: params.tokenId!,
                    receiverAddress: address,
                })
            }
        },
        [route.params, nav],
    )

    const {
        BaseTextInputElement,
        searchText,
        RenderCameraModal,
        filteredContacts,
        filteredAccounts,
        isAddressInContactsOrAccounts,
        isLoading,
    } = useSearchOrScanInput(navigateNext, setSelectedAddress, selectedAddress)

    const { getVnsAddress } = useVns()

    //Whenever search changes, we check if it's a valid address or a domain name
    useEffect(() => {
        const init = async () => {
            if (searchText && searchText.includes(".vet")) {
                const address = await getVnsAddress(searchText)

                if (address === ZERO_ADDRESS) {
                    showWarningToast({ text1: LL.NOTIFICATION_DOMAIN_NAME_NOT_FOUND() })
                    return
                }

                if (AddressUtils.isValid(address)) {
                    setSelectedAddress(address ?? "")
                    Keyboard.dismiss()
                }
            } else {
                if (searchText.length === 42 && AddressUtils.isValid(searchText)) {
                    setSelectedAddress(searchText)
                    Keyboard.dismiss()
                }
            }
        }
        init()
    }, [searchText, isAddressInContactsOrAccounts, getVnsAddress, LL])

    const onNext = useCallback(() => {
        if (isAddressInContactsOrAccounts && selectedAddress) {
            navigateNext(addressThor.toChecksumed(selectedAddress))
        } else {
            Keyboard.dismiss()
            openCreateContactSheet()
        }
    }, [isAddressInContactsOrAccounts, selectedAddress, navigateNext, openCreateContactSheet])

    const isEmpty = useMemo(
        () => !filteredContacts.length && !filteredAccounts.length,
        [filteredContacts, filteredAccounts],
    )

    return (
        <Layout
            safeAreaTestID="Insert_Address_Send_Screen"
            title={LL.BTN_SEND()}
            noStaticBottomPadding
            fixedHeader={
                <BaseView>
                    <BaseSpacer height={4} />
                    <BaseView flexDirection="row" w={100}>
                        {BaseTextInputElement}
                    </BaseView>
                </BaseView>
            }
            body={
                <BaseView mb={80}>
                    {filteredContacts.length !== 0 && (
                        <BaseAccordion
                            defaultIsOpen={!!filteredContacts.length}
                            extraData={filteredContacts.length}
                            itemHeight={CONTACT_CARD_DEFAULT_HIGHT}
                            headerComponent={
                                <BaseView flexDirection="row">
                                    <BaseText>
                                        {LL.SEND_INSERT_CONTACTS()} ({filteredContacts.length})
                                    </BaseText>
                                </BaseView>
                            }
                            bodyComponent={
                                <>
                                    {filteredContacts.map(contact => {
                                        const isSelected =
                                            !!selectedAddress &&
                                            AddressUtils.compareAddresses(contact.address, selectedAddress)

                                        const onPress = () => setSelectedAddress(contact.address)

                                        return (
                                            <ContactCard
                                                key={contact.address}
                                                containerStyle={baseStyles.contactCard}
                                                contact={contact}
                                                onPress={onPress}
                                                selected={isSelected}
                                            />
                                        )
                                    })}
                                </>
                            }
                        />
                    )}
                    {filteredAccounts.length !== 0 && (
                        <BaseAccordion
                            defaultIsOpen={!!filteredAccounts.length}
                            extraData={filteredAccounts.length}
                            itemHeight={ACCOUNT_CARD_DEFAULT_HIGHT}
                            headerComponent={
                                <BaseView flexDirection="row">
                                    <BaseText>
                                        {LL.SEND_INSERT_ACCOUNTS()} ({filteredAccounts.length})
                                    </BaseText>
                                </BaseView>
                            }
                            bodyComponent={
                                <BaseView>
                                    {filteredAccounts.map(account => {
                                        const isSelected =
                                            !!selectedAddress &&
                                            AddressUtils.compareAddresses(account.address, selectedAddress)
                                        const onPress = () => setSelectedAddress(account.address)
                                        return (
                                            <AccountCard
                                                testID="selectAccount"
                                                key={account.address}
                                                containerStyle={baseStyles.accountCard}
                                                account={account}
                                                onPress={onPress}
                                                selected={isSelected}
                                            />
                                        )
                                    })}
                                </BaseView>
                            }
                        />
                    )}

                    {isLoading ? (
                        <BaseView>
                            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" mb={10}>
                                <BaseSkeleton
                                    animationDirection="horizontalLeft"
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={theme.colors.skeletonHighlightColor}
                                    height={24}
                                    width={90}
                                />
                                <BaseSkeleton
                                    animationDirection="horizontalLeft"
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={theme.colors.skeletonHighlightColor}
                                    height={24}
                                    width={30}
                                />
                            </BaseView>
                            {[0, 1, 2, 3].map(a => {
                                return (
                                    <BaseView
                                        key={a}
                                        flexDirection="row"
                                        alignItems="center"
                                        borderRadius={16}
                                        mb={10}
                                        overflow="hidden">
                                        <BaseSkeleton
                                            containerStyle={baseStyles.skeletonContact}
                                            animationDirection="horizontalLeft"
                                            boneColor={theme.colors.skeletonBoneColor}
                                            highlightColor={theme.colors.skeletonHighlightColor}
                                            height={64}
                                            width={"100%"}
                                        />
                                    </BaseView>
                                )
                            })}
                        </BaseView>
                    ) : (
                        isEmpty && (
                            <BaseView w={100} alignItems="center">
                                <BaseText typographyFont="body">{LL.SEND_NO_CONTACTS_OR_ACCOUNTS_FOUND()}</BaseText>

                                <BaseText typographyFont="body">{LL.SEND_PLEASE_TYPE_ADDRESS()}</BaseText>
                            </BaseView>
                        )
                    )}
                </BaseView>
            }
            footer={
                <>
                    <FadeoutButton
                        testID="next-button"
                        title={LL.COMMON_BTN_NEXT()}
                        action={onNext}
                        disabled={!selectedAddress}
                        bottom={0}
                        mx={0}
                        width={"auto"}
                    />

                    <CreateContactBottomSheet
                        ref={createContactBottomSheetRef}
                        onSubmit={navigateNext}
                        onClose={closeCreateContactSheet}
                        address={selectedAddress}
                    />

                    {RenderCameraModal}
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
    skeletonContact: { width: 50, paddingVertical: 2 },
    accountCard: { marginVertical: 5, height: 74, justifyContent: "center" },
    contactCard: { marginVertical: 5, height: 64, justifyContent: "center" },
})
