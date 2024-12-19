import { useNavigation } from "@react-navigation/native"
import { FlashList, ListRenderItem } from "@shopify/flash-list"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import { useBottomSheetModal, useScrollableList, useTheme } from "~Hooks"
import { AddressUtils } from "~Utils"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    DeleteConfirmationBottomSheet,
    Layout,
    SwipeableRow,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { editContact, removeContact } from "~Storage/Redux/Actions/Contacts"
import { selectContactByAddress, selectContacts } from "~Storage/Redux/Selectors"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { AddContactButton, ContactDetailBox, ContactManagementBottomSheet } from "./Components"
import { Contact } from "~Model"

export const ContactsScreen = () => {
    // [Start] Hooks
    const nav = useNavigation()

    const theme = useTheme()

    const { LL } = useI18nContext()

    // Keep track of the swipeable items refs
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

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

    // 1 and 2 are to simulate snapIndex fully expanded.
    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } = useScrollableList(contacts, 1, 2)

    const dispatch = useAppDispatch()

    const [selectedContactAddress, setSelectedContactAddress] = useState<string>()
    const [contactToRemove, setContactToRemove] = useState<string>()

    const selectedContact = useAppSelector(state => selectContactByAddress(state, selectedContactAddress))

    // [End] Hooks

    // [Start] Methods

    const onAddContactPress = useCallback(() => nav.navigate(Routes.SETTINGS_ADD_CONTACT), [nav])

    const closeOtherSwipeableItems = useCallback((currentAddress: string) => {
        swipeableItemRefs?.current.forEach((ref, address) => {
            if (address !== currentAddress) {
                ref?.close()
            }
        })
    }, [])

    const onEditContactPress = useCallback(
        (contact: Contact) => {
            setSelectedContactAddress(contact.address)
            openEditContactSheet()
            closeOtherSwipeableItems("") // Pass an empty string to close all items
        },
        [closeOtherSwipeableItems, openEditContactSheet],
    )

    const handleRemoveContact = useCallback(() => {
        if (selectedContactAddress) {
            dispatch(removeContact(selectedContactAddress))
            swipeableItemRefs?.current.delete(selectedContactAddress)
            closeRemoveContactSheet()
        }
    }, [closeRemoveContactSheet, selectedContactAddress, dispatch])

    const handleSaveContact = useCallback(
        (_alias: string, _address: string) => {
            if (selectedContactAddress) {
                dispatch(editContact(_alias, _address, selectedContactAddress))
                closeEditContactSheet()
                setSelectedContactAddress(undefined)
            }
        },
        [closeEditContactSheet, dispatch, selectedContactAddress],
    )

    const formattedAddress = useMemo(() => {
        return AddressUtils.humanAddress(selectedContactAddress ?? "", 4, 6)
    }, [selectedContactAddress])

    // [End] Methods

    // [Start] Render sub components

    const renderAddContactButton = useMemo(() => {
        return (
            <BaseView justifyContent="center" alignItems="center" h={50} w={100} testID="create-new-contact">
                <AddContactButton onPress={onAddContactPress} />
            </BaseView>
        )
    }, [onAddContactPress])

    const handleTrashIconPress = useCallback(
        (address: string) => () => {
            setSelectedContactAddress(address)
            openRemoveContactSheet()
        },
        [openRemoveContactSheet],
    )

    const renderItem: ListRenderItem<Contact> = useCallback(
        ({ item, index }) => {
            const contactId = `contact-row-${index}`

            return (
                <SwipeableRow
                    testID={contactId}
                    item={item}
                    itemKey={item.address}
                    swipeableItemRefs={swipeableItemRefs}
                    handleTrashIconPress={handleTrashIconPress(item.address)}
                    setSelectedItem={(contact?: Contact) => setContactToRemove(contact?.address)}
                    onPress={onEditContactPress}
                    isOpen={contactToRemove === item.address}>
                    <ContactDetailBox contact={item} />
                </SwipeableRow>
            )
        },
        [handleTrashIconPress, onEditContactPress, contactToRemove],
    )

    // [End] Render sub components

    return (
        <Layout
            safeAreaTestID="ContactsScreen"
            title={LL.TITLE_CONTACTS()}
            fixedHeader={
                <BaseView pb={16}>
                    <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" w={100}>
                        {contacts.length > 0 && (
                            <BaseIcon
                                haptics="Light"
                                name="icon-plus"
                                size={24}
                                bg={theme.colors.secondary}
                                action={onAddContactPress}
                                testID="Add_Contact_Button"
                            />
                        )}
                    </BaseView>
                    <BaseSpacer height={20} />

                    <BaseText typographyFont="bodyMedium" my={8}>
                        {LL.BD_CONTACTS_LIST()}
                    </BaseText>
                    <BaseText typographyFont="caption">{LL.BD_CONTACTS_LIST_DISCLAIMER()}</BaseText>
                </BaseView>
            }
            fixedBody={
                <>
                    {/* Add contact button if contacts list is empty */}
                    {!contacts.length && renderAddContactButton}

                    {/* Contacts List */}
                    {!!contacts.length && (
                        <BaseView flexDirection="row" style={[baseStyles.list]}>
                            <FlashList
                                extraData={contactToRemove}
                                data={contacts}
                                keyExtractor={contact => contact.address}
                                onViewableItemsChanged={onViewableItemsChanged}
                                viewabilityConfig={viewabilityConfig}
                                scrollEnabled={isListScrollable}
                                ListHeaderComponent={<BaseSpacer height={20} />}
                                ListFooterComponent={<BaseSpacer height={20} />}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                estimatedItemSize={80}
                                estimatedListSize={{
                                    height: 80 * contacts.length,
                                    width: 400,
                                }}
                                testID="contacts-list"
                            />
                        </BaseView>
                    )}

                    {/* Bottom Sheets */}
                    <DeleteConfirmationBottomSheet
                        ref={confirmRemoveContactSheet}
                        onClose={closeRemoveContactSheet}
                        onConfirm={handleRemoveContact}
                        title={LL.BD_CONFIRM_REMOVE_CONTACT()}
                        description={LL.BD_CONFIRM_REMOVE_CONTACT_DESC()}
                        deletingElement={
                            <BaseView w={100} flexDirection="row">
                                <BaseTouchableBox
                                    justifyContent="space-between"
                                    containerStyle={baseStyles.contactContainer}
                                    activeOpacity={1}>
                                    <BaseView flexDirection="column">
                                        <BaseText typographyFont="button">{selectedContact?.alias}</BaseText>
                                        <BaseSpacer height={4} />
                                        <BaseText fontSize={10} typographyFont="smallCaptionRegular">
                                            {formattedAddress}
                                        </BaseText>
                                    </BaseView>
                                </BaseTouchableBox>
                            </BaseView>
                        }
                    />
                    <ContactManagementBottomSheet
                        ref={editContactSheet}
                        contact={selectedContact}
                        onClose={closeEditContactSheet}
                        onSaveContact={handleSaveContact}
                    />
                </>
            }
        />
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    plusContactButton: {
        justifyContent: "center",
        flexDirection: "column",
    },
    list: {
        top: 0,
        flex: 1,
        marginBottom: 0,
    },
    contactContainer: { flex: 1 },
})
