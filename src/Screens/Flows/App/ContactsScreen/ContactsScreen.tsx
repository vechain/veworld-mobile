import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import {
    FormattingUtils,
    useBottomSheetModal,
    useScrollableList,
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
    OpenDirection,
    SwipeableItemImperativeRef,
} from "react-native-swipeable-item"
import {
    AddContactButton,
    ContactDetailBox,
    EditContactBottomSheet,
    UnderlayLeft,
} from "./Components"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"

const underlaySnapPoints = [58]

export const ContactsScreen = () => {
    // [Start] Hooks
    const nav = useNavigation()

    const theme = useTheme()

    const goBack = useCallback(() => nav.goBack(), [nav])

    const insets = useSafeAreaInsets()

    const tabBarHeight = useBottomTabBarHeight()

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

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(contacts, 1, 2) // 1 and 2 are to simulate snapIndex fully expanded.

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

    const onSwipeableItemChange = useCallback(
        (address: string) => {
            closeOtherSwipeableItems("")
            onDeleteContactPress(address)
        },
        [closeOtherSwipeableItems, onDeleteContactPress],
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
                <BaseView
                    flexDirection="row"
                    style={[
                        baseStyles.list,
                        { paddingBottom: tabBarHeight - insets.bottom },
                    ]}>
                    <FlashList
                        data={contacts}
                        keyExtractor={contact => contact.address}
                        ItemSeparatorComponent={contactsListSeparator}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        scrollEnabled={isListScrollable}
                        ListFooterComponent={<BaseSpacer height={20} />}
                        renderItem={({ item: contact }) => {
                            const contactId = `${contact.address}-${contact.alias}`

                            return (
                                <BaseView mx={20} testID={contactId}>
                                    <SwipeableItem
                                        ref={ref =>
                                            registerSwipeableItemRef(
                                                contact.address,
                                                ref,
                                            )
                                        }
                                        key={contact.address}
                                        item={contact}
                                        onChange={({ openDirection }) => {
                                            if (
                                                openDirection !==
                                                OpenDirection.NONE
                                            )
                                                onSwipeableItemChange(
                                                    contact.address,
                                                )
                                        }}
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
                            height: 80 * contacts.length,
                            width: 400,
                        }}
                        testID="contacts-list"
                    />
                </BaseView>
            </>
        )
    }, [
        contacts,
        contactsListSeparator,
        insets.bottom,
        isListScrollable,
        onDeleteContactPress,
        onEditContactPress,
        onSwipeableItemChange,
        onViewableItemsChanged,
        registerSwipeableItemRef,
        tabBarHeight,
        viewabilityConfig,
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
                    <BaseText
                        typographyFont="title"
                        testID="contacts-screen-title">
                        {LL.TITLE_CONTACTS()}
                    </BaseText>
                    {contacts.length > 0 && (
                        <BaseIcon
                            style={baseStyles.addContactIcon}
                            name={"plus"}
                            size={24}
                            bg={theme.colors.secondary}
                            action={onAddContactPress}
                            testID="add-contact-button"
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
                title={LL.BD_CONFIRM_REMOVE_CONTACT()}
                description={LL.BD_CONFIRM_REMOVE_CONTACT_DESC()}
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
        top: 0,
        flex: 1,
    },
    contactContainer: { flex: 1 },
})
