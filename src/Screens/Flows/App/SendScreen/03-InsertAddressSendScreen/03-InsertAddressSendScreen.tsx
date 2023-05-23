import React, { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { StyleSheet } from "react-native"
import { AddressUtils, debug, useBottomSheetModal, useTheme } from "~Common"
import {
    AccountCard,
    BackButtonHeader,
    BaseAccordion,
    BaseButton,
    BaseIcon,
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
    selectAccountsButSelected,
    selectKnownContacts,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { CreateContactBottomSheet } from "./Components/CreateContactBottomSheet/CreateContactBottomSheet"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.INSERT_ADDRESS_SEND
>

export const InsertAddressSendScreen = ({ route }: Props) => {
    const { token, amount, initialRoute } = route.params
    const { LL } = useI18nContext()
    const [address, setAddress] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isValid, setIsValid] = useState(false)
    const theme = useTheme()
    const nav = useNavigation()
    const accounts = useAppSelector(selectAccountsButSelected)
    const contacts = useAppSelector(selectKnownContacts)
    const foundInContactsOrAccounts = !!(
        contacts.find(
            contact => contact.address.toLowerCase() === address.toLowerCase(),
        ) ||
        accounts.find(
            account => account.address.toLowerCase() === address.toLowerCase(),
        )
    )
    const {
        ref: refCreateContactBottomSheet,
        onOpen: openCreateContactSheet,
        onClose: closeCreateContactSheet,
    } = useBottomSheetModal()

    const handleAddressChange = (addressRaw: string) => {
        const newAddress = addressRaw.toLowerCase()
        setErrorMessage("")
        setIsValid(false)
        setAddress(newAddress.toLowerCase())
        if (AddressUtils.isValid(newAddress)) {
            debug("Valid address")
            setIsValid(true)
        }
    }
    const onOpenCamera = () => {
        nav.navigate(Routes.CAMERA, { onScan: handleAddressChange })
    }
    const goToResumeStep = () => {
        nav.navigate(Routes.TRANSACTION_SUMMARY_SEND, {
            token,
            amount,
            address,
            initialRoute: initialRoute ?? "",
        })
    }
    const checkIfContactExist = () => {
        if (foundInContactsOrAccounts) {
            goToResumeStep()
        } else {
            openCreateContactSheet()
        }
    }

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <ScrollViewWithFooter
                footer={
                    <>
                        <BaseButton
                            style={styles.nextButton}
                            mx={24}
                            title={LL.COMMON_BTN_NEXT()}
                            disabled={!isValid}
                            action={checkIfContactExist}
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
                            value={address}
                            setValue={handleAddressChange}
                            placeholder={LL.SEND_ENTER_AN_ADDRESS()}
                            errorMessage={errorMessage}
                        />
                        {!address && (
                            <BaseIcon
                                name={"flip-horizontal"}
                                size={24}
                                color={theme.colors.primary}
                                action={onOpenCamera}
                                style={styles.icon}
                            />
                        )}
                    </BaseView>
                </BaseView>
                <BaseView mx={24}>
                    <BaseAccordion
                        headerComponent={
                            <BaseView flexDirection="row">
                                <BaseText>
                                    {LL.SEND_INSERT_CONTACTS()} (
                                    {contacts.length})
                                </BaseText>
                            </BaseView>
                        }
                        bodyComponent={
                            <BaseView>
                                {contacts.map(contact => (
                                    <ContactCard
                                        key={contact.address}
                                        containerStyle={styles.contactCard}
                                        contact={contact}
                                        onPress={() =>
                                            handleAddressChange(contact.address)
                                        }
                                        selected={
                                            contact.address.toLowerCase() ===
                                            address.toLowerCase()
                                        }
                                    />
                                ))}
                            </BaseView>
                        }
                    />
                    <BaseAccordion
                        headerComponent={
                            <BaseView flexDirection="row">
                                <BaseText>
                                    {LL.SEND_INSERT_ACCOUNTS()} (
                                    {accounts.length})
                                </BaseText>
                            </BaseView>
                        }
                        /*TODO: fix accordions with dynamic content */
                        bodyComponent={
                            <BaseView>
                                {accounts.map(account => (
                                    <AccountCard
                                        key={account.address}
                                        containerStyle={styles.accountCard}
                                        account={account}
                                        onPress={() =>
                                            handleAddressChange(account.address)
                                        }
                                        selected={
                                            account.address.toLowerCase() ===
                                            address.toLowerCase()
                                        }
                                    />
                                ))}
                            </BaseView>
                        }
                    />
                </BaseView>
            </ScrollViewWithFooter>
            <CreateContactBottomSheet
                ref={refCreateContactBottomSheet}
                handleClose={closeCreateContactSheet}
                goToResumeStep={goToResumeStep}
                address={address}
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
