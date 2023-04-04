import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { AddressUtils, FormUtils, useTheme } from "~Common"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes, tabbarBaseStyles } from "~Navigation"
import { useAppDispatch, useAppSelector } from "~Storage"
import { addContact } from "~Storage/Redux/Actions/Contacts"
import { ContactForm } from "./Components"
import { selectContacts } from "~Storage/Redux/Selectors"
import { address as thorAddress } from "thor-devkit"

const MAX_INPUT_LENGTH = 19

export const AddContactScreen = () => {
    // [START] Hooks
    const nav = useNavigation()

    const theme = useTheme()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const contacts = useAppSelector(selectContacts)
    // [END] Hooks

    // [START] States
    const [name, setName] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    const [isValidForm, setIsValidForm] = useState<boolean>(false)
    // [END] States

    // [START] Methods
    const validateName = useCallback(
        (contactName: string) => {
            if (contactName.length === 0) {
                return LL.ERROR_REQUIRED_FIELD()
            }
            if (contactName.length > MAX_INPUT_LENGTH) {
                return LL.ERROR_MAX_INPUT_LENGTH()
            }
            if (FormUtils.alreadyExists(contactName, contacts, "alias")) {
                return LL.ERROR_NAME_ALREADY_EXISTS()
            }
            return ""
        },
        [LL, contacts],
    )

    const validateAddress = useCallback(
        (contactAddress: string) => {
            if (contactAddress.length === 0) {
                return LL.ERROR_REQUIRED_FIELD()
            }
            if (!AddressUtils.isValid(contactAddress)) {
                return LL.ERROR_ADDRESS_INVALID()
            }
            if (
                FormUtils.alreadyExists(
                    thorAddress.toChecksumed(contactAddress),
                    contacts,
                    "address",
                )
            ) {
                return LL.ERROR_ADDRESS_EXISTS()
            }
            return ""
        },
        [LL, contacts],
    )

    const onCreateContact = useCallback(() => {
        if (isValidForm) {
            dispatch(addContact(name, address))
            nav.navigate(Routes.SETTINGS_CONTACTS)
        }
    }, [address, dispatch, isValidForm, name, nav])
    // [END] Methods

    return (
        <BaseSafeArea grow={1}>
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />

            <BaseSpacer height={22} />

            <BaseView
                alignItems="center"
                justifyContent="space-between"
                mx={20}
                flexGrow={1}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="title">
                        {LL.TITLE_ADD_CONTACT()}
                    </BaseText>

                    <BaseSpacer height={20} />

                    <BaseText typographyFont="bodyMedium" my={8}>
                        {LL.BD_ADD_CONTACT()}
                    </BaseText>
                    <BaseText typographyFont="caption">
                        {LL.BD_ADD_CONTACT_DISCLAIMER()}
                    </BaseText>

                    <BaseSpacer height={20} />

                    <ContactForm
                        placeholderName={LL.PLACEHOLDER_ENTER_NAME()}
                        placeholderAddress={LL.PLACEHOLDER_ENTER_ADDRESS()}
                        titleName={LL.BD_CONTACT_NAME()}
                        titleAddress={LL.BD_CONTACT_ADDRESS()}
                        name={name}
                        address={address}
                        setName={setName}
                        setAddress={setAddress}
                        setIsValidForm={setIsValidForm}
                        validateName={validateName}
                        validateAddress={validateAddress}
                    />

                    <BaseSpacer height={20} />

                    <BaseView flexDirection="row">
                        <BaseTouchableBox
                            action={() => {}} // TODO: add action
                            w="auto"
                            flex={1}
                            justifyContent="space-between">
                            <BaseIcon
                                name="clipboard-outline"
                                size={20}
                                color={theme.colors.text}
                            />
                            <BaseText>{LL.BTN_PASTE_ADDRESS()}</BaseText>
                        </BaseTouchableBox>
                        <BaseSpacer width={16} />
                        <BaseTouchableBox
                            action={() => {}} // TODO: add action
                            w="auto"
                            flex={1}
                            justifyContent="space-between">
                            <BaseIcon
                                name="flip-horizontal"
                                size={20}
                                color={theme.colors.text}
                            />
                            <BaseText>{LL.BTN_SCAN_QR_CODE()}</BaseText>
                        </BaseTouchableBox>
                    </BaseView>
                </BaseView>

                <BaseSpacer height={20} />

                <BaseView alignItems="center" w={100}>
                    <BaseButton
                        action={onCreateContact}
                        w={100}
                        px={20}
                        title={LL.BTN_ADD_CONTACT().toUpperCase()}
                        disabled={!isValidForm}
                        bgColor={theme.colors.primary}
                        style={baseStyles.primaryButton}
                    />
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    primaryButton: {
        marginBottom: tabbarBaseStyles.tabbar.height * 1.1,
    },
})
