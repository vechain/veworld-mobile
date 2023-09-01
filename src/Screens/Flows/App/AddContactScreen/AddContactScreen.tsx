import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { useTheme } from "~Hooks"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
    Layout,
    showErrorToast,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useAppDispatch } from "~Storage/Redux"
import { addContact } from "~Storage/Redux/Actions/Contacts"
import { ContactForm } from "./Components"
import { useContactValidation } from "../ContactsScreen"
import { StyleSheet } from "react-native"

export const AddContactScreen = () => {
    // [START] Hooks
    const nav = useNavigation()

    const theme = useTheme()

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
            try {
                dispatch(addContact(name, address))
                nav.navigate(Routes.SETTINGS_CONTACTS)
            } catch (e) {
                showErrorToast(LL.ERROR(), LL.ERROR_GENERIC_OPERATION())
            }
        }
    }, [LL, address, dispatch, isFormValid, name, nav])

    return (
        <Layout
            safeAreaTestID="Add_Contact_Screen"
            title={LL.TITLE_ADD_CONTACT()}
            body={
                <DismissKeyboardView>
                    <BaseView flexGrow={1} justifyContent="space-between">
                        <BaseView>
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
                                valueAddress={address}
                            />

                            <BaseSpacer height={20} />
                        </BaseView>
                    </BaseView>
                </DismissKeyboardView>
            }
            footer={
                <BaseButton
                    haptics="Light"
                    action={onCreateContact}
                    w={100}
                    px={20}
                    title={LL.BTN_ADD_CONTACT().toUpperCase()}
                    disabled={!isFormValid}
                    bgColor={theme.colors.primary}
                    style={styles.baseButtonBottomPadding}
                    testID="Add_Contact_Button"
                />
            }
        />
    )
}

const styles = StyleSheet.create({
    baseButtonBottomPadding: {
        marginBottom: 16,
    },
})
