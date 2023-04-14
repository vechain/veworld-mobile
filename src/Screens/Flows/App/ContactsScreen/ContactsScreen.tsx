import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import {
    FormattingUtils,
    PlatformUtils,
    useBottomSheetModal,
    useTheme,
} from "~Common"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    DeleteConfirmationBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { editContact, removeContact } from "~Storage/Redux/Actions/Contacts"
import {
    selectContactByAddress,
    selectContacts,
} from "~Storage/Redux/Selectors"
import SwipeableItem, {
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"
import {
    AddContactButton,
    ContactDetailBox,
    EditContactBottomSheet,
    UnderlayLeft,
} from "./Components"

const underlaySnapPoints = [58]

export const ContactsScreen = () => {
    // [Start] Hooks
    const nav = useNavigation()

    const theme = useTheme()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const { LL } = useI18nContext()

    // Keep track of the swipeable items refs
    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(
        new Map(),
    )

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

    const [selectedContactAddress, setSelectedContactAddress] =
        useState<string>()

    const selectedContact = useAppSelector(
        selectContactByAddress(selectedContactAddress),
    )

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

    const closeOtherSwipeableItems = useCallback((currentAddress: string) => {
        swipeableItemRefs?.current.forEach((ref, address) => {
            if (address !== currentAddress) {
                ref?.close()
            }
        })
    }, [])

    const onDeleteContactPress = useCallback(
        (address: string) => {
            setSelectedContactAddress(address)

            openRemoveContactSheet()
        },
        [openRemoveContactSheet],
    )

    const onEditContactPress = useCallback(
        (name: string, address: string) => {
            setSelectedContactAddress(address)

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

    const handleEditContact = useCallback(
        (_alias: string, _address: string) => {
            if (selectedContactAddress) {
                dispatch(editContact(_alias, _address, selectedContactAddress))
                closeEditContactSheet()
            }
        },
        [closeEditContactSheet, dispatch, selectedContactAddress],
    )

    const registerSwipeableItemRef = useCallback(
        (address: string, ref: SwipeableItemImperativeRef | null) => {
            if (ref) swipeableItemRefs.current.set(address, ref)
        },
        [],
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
                        renderItem={({ item: contact }) => {
                            return (
                                <BaseView mx={20}>
                                    <SwipeableItem
                                        ref={ref =>
                                            registerSwipeableItemRef(
                                                contact.address,
                                                ref,
                                            )
                                        }
                                        key={contact.address}
                                        item={contact}
                                        renderUnderlayLeft={() => (
                                            <UnderlayLeft
                                                onDelete={onDeleteContactPress}
                                            />
                                        )}
                                        snapPointsLeft={underlaySnapPoints}>
                                        <ContactDetailBox
                                            contact={contact}
                                            onEditPress={onEditContactPress}
                                        />
                                    </SwipeableItem>
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
        registerSwipeableItemRef,
    ])

    // [End] Render sub components

    return (
        <BaseSafeArea
            grow={1}
            onTouchStart={() => closeOtherSwipeableItems("")}>
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
                            size={24}
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

            {/* Add contact button if contacts list is empty */}
            {!contacts.length && renderAddContactButton()}

            {/* Contacts List */}
            {!!contacts.length && renderContactsList()}

            {/* Bottom Sheets */}
            <DeleteConfirmationBottomSheet
                ref={confirmRemoveContactSheet}
                onClose={closeRemoveContactSheet}
                onConfirm={handleRemoveContact}
                description={LL.BD_CONFIRM_REMOVE_CONTACT()}
                deletingElement={
                    <BaseView w={100} flexDirection="row">
                        <BaseTouchableBox
                            justifyContent="space-between"
                            containerStyle={baseStyles.contactContainer}
                            activeOpacity={1}>
                            <BaseView flexDirection="column">
                                <BaseText typographyFont="button">
                                    {selectedContact?.alias}
                                </BaseText>
                                <BaseSpacer height={4} />
                                <BaseText
                                    fontSize={10}
                                    typographyFont="smallCaptionRegular">
                                    {FormattingUtils.humanAddress(
                                        selectedContactAddress || "",
                                        4,
                                        6,
                                    )}
                                </BaseText>
                            </BaseView>
                        </BaseTouchableBox>
                    </BaseView>
                }
            />
            <EditContactBottomSheet
                ref={editContactSheet}
                contact={selectedContact}
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
    contactContainer: { flex: 1 },
})
