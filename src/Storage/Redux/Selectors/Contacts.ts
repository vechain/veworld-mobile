import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { Contact, ContactType } from "~Model"

/**
 * selectContactsState: A selector to get the contacts state from the root state.
 * @param {RootState} state - The root state of the Redux store.
 * @returns {ContactsState} - The contacts state.
 */
const selectContactsState = (state: RootState) => state.contacts

/**
 * selectContacts: A selector to get all the contacts.
 * @returns {Contact[]} - An array of all contacts.
 */
export const selectContacts = createSelector(selectContactsState, state => {
    return state.contacts
})

/**
 * selectCachedContacts: A selector to get all the `ContactType.CACHE` contacts.
 * @returns {Contact[]} - An array of cached contacts.
 */
export const selectCachedContacts = createSelector(
    selectContactsState,
    state => {
        return state.contacts.filter(
            (contact: Contact) => contact.type === ContactType.CACHE,
        )
    },
)

/**
 * selectKnownContacts: A selector to get all the `ContactType.KNOWN` contacts.
 * @returns {Contact[]} - An array of known contacts.
 */
export const selectKnownContacts = createSelector(
    selectContactsState,
    state => {
        return state.contacts.filter(
            (contact: Contact) => contact.type === ContactType.KNOWN,
        )
    },
)

/**
 * selectContactByAddress: A selector to get a contact by its address.
 * @param {string} _address - The address of the contact to find.
 * @returns {Contact | undefined} - The contact with the specified address, or undefined if not found.
 */
export const selectContactByAddress = (_address?: string) =>
    createSelector(selectContactsState, state => {
        return state.contacts.find(
            (contact: Contact) => contact.address === _address,
        )
    })

/**
 * selectContactsByAddresses: A selector to get contacts by their addresses.
 * @param {string[]} _addresses - An array of addresses of the contacts to find.
 * @returns {Contact[]} - An array of contacts with the specified addresses. If a contact is not found for an address, it will be excluded from the result.
 */
export const selectContactsByAddresses = (_addresses?: string[]) =>
    createSelector(selectContactsState, state => {
        return state.contacts.filter((contact: Contact) =>
            _addresses?.includes(contact.address),
        )
    })
