import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AccountUtils, AddressUtils } from "~Utils"
import { Contact, RecentContact } from "~Model"
import { address as addressThor } from "thor-devkit"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"

type RecentContacts = Record<
    string,
    {
        [accountAddress: string]: Array<RecentContact>
    }
>

export type ContactsSliceState = {
    contacts: Contact[]
    recentContacts: RecentContacts
}

export const initialContactsState: ContactsSliceState = {
    contacts: [],
    recentContacts: {
        [defaultMainNetwork.genesis.id]: {},
        [defaultTestNetwork.genesis.id]: {},
    },
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
        upsertRecentContact: (
            state,
            action: PayloadAction<{ selectedAccountAddress: string; genesisId: string; contact: RecentContact }>,
        ) => {
            const { selectedAccountAddress, genesisId, contact } = action.payload

            if (!state.recentContacts[genesisId]) {
                state.recentContacts[genesisId] = {}
            }

            if (!state.recentContacts[genesisId][selectedAccountAddress]) {
                state.recentContacts[genesisId][selectedAccountAddress] = []
            }

            const recentContactIdx = state.recentContacts[genesisId][selectedAccountAddress].findIndex(c =>
                AddressUtils.compareAddresses(c.address, contact.address),
            )

            if (recentContactIdx === -1) {
                state.recentContacts[genesisId][selectedAccountAddress].push(contact)
            } else {
                state.recentContacts[genesisId][selectedAccountAddress][recentContactIdx] = contact
            }
        },
        resetContactsState: () => initialContactsState,
    },
})

export const { insertContact, deleteContact, updateContact, setContactsVns, upsertRecentContact, resetContactsState } =
    ContactsSlice.actions
