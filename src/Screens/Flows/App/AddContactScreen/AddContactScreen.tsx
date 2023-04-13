import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Common"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes, tabbarBaseStyles } from "~Navigation"
import { useAppDispatch } from "~Storage/Redux"
import { addContact } from "~Storage/Redux/Actions/Contacts"
import { ContactForm } from "./Components"
import { useContactValidation } from "../ContactsScreen"

export const AddContactScreen = () => {
    // [START] Hooks
    const nav = useNavigation()

    const theme = useTheme()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    // [END] Hooks

    // [START] States
    const [name, setName] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    // [END] States

    const { validateName, validateAddress } = useContactValidation(false)

    const { nameError, addressError } = {
        nameError: validateName(name),
        addressError: validateAddress(address),
    }

    const isFormValid = useMemo(() => {
        return nameError.length === 0 && addressError.length === 0
    }, [addressError.length, nameError.length])

    const onCreateContact = useCallback(() => {
        if (isFormValid) {
            dispatch(addContact(name, address))
            nav.navigate(Routes.SETTINGS_CONTACTS)
        }
    }, [address, dispatch, isFormValid, name, nav])

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
                        nameError={nameError}
                        addressError={addressError}
                        setName={setName}
                        setAddress={setAddress}
                    />

                    <BaseSpacer height={20} />
                </BaseView>

                <BaseSpacer height={20} />

                <BaseView alignItems="center" w={100}>
                    <BaseButton
                        action={onCreateContact}
                        w={100}
                        px={20}
                        title={LL.BTN_ADD_CONTACT().toUpperCase()}
                        disabled={!isFormValid}
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
