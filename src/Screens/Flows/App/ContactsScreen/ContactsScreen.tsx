import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { PlatformUtils, useBottomSheetModal, useTheme } from "~Common"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useAppDispatch, useAppSelector } from "~Storage"
import { editContact, removeContact } from "~Storage/Redux/Actions/Contacts"
import { selectContacts } from "~Storage/Redux/Selectors"
import {
    AddContactButton,
    ContactDetailBox,
    EditContactBottomSheet,
    RemoveContactBottomSheet,
} from "./Components"

export const ContactsScreen = () => {
    // [Start] Hooks
    const nav = useNavigation()

    const theme = useTheme()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const { LL } = useI18nContext()

    /* Bottom Sheets */
    const {
        ref: confirmRemoveContactSheet,
        onOpen: openRemoveContactSheet,
        onClose: closeRemoveContactSheet,
    } = useBottomSheetModal()

    const {
        ref: editContactSheet,
        onOpen: openEditContactSheet,
        onClose: closeEditContactSheet,
    } = useBottomSheetModal()

    const contacts = useAppSelector(selectContacts)

    const dispatch = useAppDispatch()

    // Address of the contact the user wants to delete/edit
    const [currentContactAddress, setCurrentContactAddress] =
        useState<string>("")
    // Address of the contact before the user edits it
    const [previousContactAddress, setPreviousContactAddress] =
        useState<string>("")
    const [currentContactName, setCurrentContactName] = useState<string>("")

    // [End] Hooks

    // [Start] Methods

    const onAddContactPress = useCallback(
        () => nav.navigate(Routes.SETTINGS_ADD_CONTACT),
        [nav],
    )

    const contactsListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const onDeleteContactPress = useCallback(
        (address: string) => {
            setCurrentContactAddress(address)

            openRemoveContactSheet()
        },
        [openRemoveContactSheet],
    )

    const onEditContactPress = useCallback(
        (name: string, address: string) => {
            setCurrentContactAddress(address)
            setPreviousContactAddress(address)
            setCurrentContactName(name)

            openEditContactSheet()
        },
        [openEditContactSheet],
    )

    const handleRemoveContact = useCallback(() => {
        if (currentContactAddress) {
            dispatch(removeContact(currentContactAddress))
            closeRemoveContactSheet()
        }
    }, [closeRemoveContactSheet, currentContactAddress, dispatch])

    const handleEditContact = useCallback(
        (_alias: string, _address: string) => {
            if (previousContactAddress) {
                dispatch(editContact(_alias, _address, previousContactAddress))
                closeEditContactSheet()
            }
        },
        [closeEditContactSheet, dispatch, previousContactAddress],
    )

    // [End] Methods

    // [Start] Render sub components

    const renderAddContactButton = useCallback(() => {
        return (
            <BaseView
                justifyContent="center"
                alignItems="center"
                h={50}
                w={100}>
                <AddContactButton onPress={onAddContactPress} />
            </BaseView>
        )
    }, [onAddContactPress])

    const renderContactsList = useCallback(() => {
        return (
            <>
                <BaseSpacer height={20} />
                <BaseView flexDirection="row" style={baseStyles.list}>
                    <FlashList
                        data={contacts}
                        keyExtractor={contact => contact.address}
                        ItemSeparatorComponent={contactsListSeparator}
                        renderItem={({ item }) => {
                            return (
                                <BaseView mx={20}>
                                    <ContactDetailBox
                                        contact={item}
                                        onDeletePress={onDeleteContactPress}
                                        onEditPress={onEditContactPress}
                                    />
                                </BaseView>
                            )
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        estimatedItemSize={80}
                        estimatedListSize={{
                            height: 184,
                            width: 400,
                        }}
                    />
                </BaseView>
            </>
        )
    }, [
        contacts,
        contactsListSeparator,
        onDeleteContactPress,
        onEditContactPress,
    ])

    // [End] Render sub components

    return (
        <BaseSafeArea grow={1}>
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />

            <BaseSpacer height={12} />
            <BaseView mx={20}>
                <BaseView flexDirection="row" w={100}>
                    <BaseText typographyFont="title">
                        {LL.TITLE_CONTACTS()}
                    </BaseText>
                    {contacts.length > 0 && (
                        <BaseIcon
                            style={baseStyles.addContactIcon}
                            name={"plus"}
                            size={32}
                            bg={theme.colors.secondary}
                            action={onAddContactPress}
                        />
                    )}
                </BaseView>
                <BaseSpacer height={20} />

                <BaseText typographyFont="bodyMedium" my={8}>
                    {LL.BD_CONTACTS_LIST()}
                </BaseText>
                <BaseText typographyFont="caption">
                    {LL.BD_CONTACTS_LIST_DISCLAIMER()}
                </BaseText>
            </BaseView>

            {/* Add contact button if List is empty */}
            {!contacts.length && renderAddContactButton()}

            {/* Contacts List */}
            {!!contacts.length && renderContactsList()}

            {/* Bottom Sheets */}
            <RemoveContactBottomSheet
                ref={confirmRemoveContactSheet}
                onClose={closeRemoveContactSheet}
                onRemoveContact={handleRemoveContact}
            />

            <EditContactBottomSheet
                ref={editContactSheet}
                currentContactName={currentContactName}
                currentContactAddress={currentContactAddress}
                previousContactAddress={previousContactAddress}
                setCurrentContactName={setCurrentContactName}
                setCurrentContactAddress={setCurrentContactAddress}
                onClose={closeEditContactSheet}
                onEditContact={handleEditContact}
            />
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    addContactIcon: {
        marginHorizontal: 2,
        alignSelf: "flex-end",
    },
    plusContactButton: {
        justifyContent: "center",
        flexDirection: "column",
    },
    list: {
        height: PlatformUtils.isIOS() ? "70%" : "76%",
    },
})
