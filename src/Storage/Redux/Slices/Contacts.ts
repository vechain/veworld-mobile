import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AccountUtils, AddressUtils } from "~Utils"
import { Contact } from "~Model"
import { address as addressThor } from "thor-devkit"

type ContactsSliceState = {
    contacts: Contact[]
}

export const initialContactsState: ContactsSliceState = {
    contacts: [],
}

export const ContactsSlice = createSlice({
    name: "contacts",
    initialState: initialContactsState,
    reducers: {
        insertContact: (state, action: PayloadAction<Contact>) => {
            const contactExists = state.contacts.find(contact =>
                AddressUtils.compareAddresses(contact.address, action.payload.address),
            )
            if (!contactExists) {
                state.contacts.push(action.payload)
            }
        },
        deleteContact: (state, action: PayloadAction<{ contactAddress: string }>) => {
            const contactExistsIndex = state.contacts.findIndex(contact =>
                AddressUtils.compareAddresses(contact.address, action.payload.contactAddress),
            )

            if (contactExistsIndex !== -1) {
                state.contacts.splice(contactExistsIndex, 1)
            }
        },
        updateContact: (
            state,
            action: PayloadAction<{
                alias: string
                address: string
                previousAddress: string
            }>,
        ) => {
            const { alias, address, previousAddress } = action.payload

            const contactExistsIndex = state.contacts.findIndex(contact =>
                AddressUtils.compareAddresses(contact.address, previousAddress),
            )

            if (contactExistsIndex !== -1) {
                state.contacts[contactExistsIndex].address = addressThor.toChecksumed(address)
                state.contacts[contactExistsIndex].alias = alias
            }
        },
        setContactsVns: (state, action: PayloadAction<{ domain: string; address: string }[]>) => {
            state.contacts.forEach(contact => {
                contact.vnsName = (AccountUtils.updateAccountVns(contact, action.payload) as Contact).vnsName
            })
        },
        resetContactsState: () => initialContactsState,
    },
})

export const { insertContact, deleteContact, updateContact, setContactsVns, resetContactsState } = ContactsSlice.actions
