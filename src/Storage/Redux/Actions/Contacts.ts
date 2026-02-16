import { address } from "thor-devkit"
import { ERROR_EVENTS } from "~Constants"
import { Contact, ContactType } from "~Model"
import { AddressUtils, FormUtils, error } from "~Utils"
import TransactionUtils from "~Utils/TransactionUtils"
import { deleteContact, insertContact } from "../Slices"
import { updateContact, upsertRecentContact } from "../Slices/Contacts"
import { AppThunk } from "../Types"

/**
 * createContact: A utility function to create a Contact object.
 * @param {string} _alias - The alias of the contact.
 * @param {string} _address - The address of the contact.
 * @param {ContactType} _type - The type of the contact (KNOWN or CACHE).
 * @returns {Contact} - A Contact object with the specified properties.
 */
const createContact = (_alias: string, _address: string, _type: ContactType): Contact => {
    const contact: Contact = {
        alias: _alias,
        address: _address ? address.toChecksumed(_address) : "",
        type: _type,
    }

    return contact
}

/**
 * The `addContact` action adds a new contact with the given alias and
 * address to the contacts state. Throws an error if the contact already
 * exists.
 *
 * @param {_alias: string} - The alias of the new contact.
 * @param {_address: string} - The address of the new contact.
 * @returns {AppThunk<Contact>} - A Redux thunk that dispatches the action.
 */
const addContact =
    (_alias: string, _address: string): AppThunk =>
    (dispatch, getState) => {
        const { contacts: contactsState } = getState()

        const checksumedAddress = address.toChecksumed(_address)

        const contactExists = FormUtils.alreadyExists(checksumedAddress, contactsState.contacts, "address")

        if (contactExists) {
            error(ERROR_EVENTS.SETTINGS, "Contact already exists!")
            return
        }

        const contact: Contact = createContact(_alias, _address, ContactType.KNOWN)
        dispatch(insertContact(contact))
    }

/**
 * The `removeContact` action removes the contact with the given address
 * from the contacts state. Throws an error if the contact does not exist.
 *
 * @param {_address: string} - The address of the contact to remove.
 * @returns {AppThunk} - A Redux thunk that dispatches the action.
 */
const removeContact =
    (_address: string): AppThunk =>
    (dispatch, getState) => {
        const { contacts: contactsState } = getState()

        const checksumedAddress = address.toChecksumed(_address)

        const contactExists = FormUtils.alreadyExists(checksumedAddress, contactsState.contacts, "address")

        if (!contactExists) throw new Error("Contact does not exist!")

        dispatch(deleteContact({ contactAddress: checksumedAddress }))
    }

/**
 * The `editContact` action updates the alias and address of an existing
 * contact in the contacts state, identified by its previous address.
 * Throws an error if the contact does not exist.
 *
 * @param {_alias: string} - The updated alias of the contact.
 * @param {_address: string} - The updated address of the contact.
 * @param {_previousAddress: string} - The previous address of the contact
 *                                     used to identify the contact.
 * @returns {AppThunk} - A Redux thunk that dispatches the action.
 */
const editContact =
    (_alias: string, _address: string, _previousAddress: string): AppThunk =>
    (dispatch, getState) => {
        const { contacts: contactsState } = getState()

        const checksumedAddress = address.toChecksumed(_address)
        const checksumedPreviousAddress = address.toChecksumed(_previousAddress)

        const contactExists = FormUtils.alreadyExists(checksumedPreviousAddress, contactsState.contacts, "address")

        if (!contactExists) throw new Error("Contact does not exist!")

        dispatch(
            updateContact({
                alias: _alias,
                address: checksumedAddress,
                previousAddress: checksumedPreviousAddress,
            }),
        )
    }

const createRecentContact =
    (clauses: Connex.VM.Clause[], genesisId: string): AppThunk =>
    (dispatch, getState) => {
        const { accounts: accountsState, contacts: contactsState } = getState()
        const selectedAccountAddress = accountsState.selectedAccount

        let recipientAddress = ""

        if (!selectedAccountAddress) {
            error(ERROR_EVENTS.SETTINGS, "No selected account found!")
            return
        }

        recipientAddress = TransactionUtils.getRecipientAddressFromClause(clauses) ?? ""

        if (!recipientAddress) {
            error(ERROR_EVENTS.SETTINGS, "Can't create recent contact with invalid recipient address!")
            return
        }

        let alias: string | undefined
        const timestamp = Date.now()

        const accountExists = accountsState.accounts.find(account =>
            AddressUtils.compareAddresses(account.address, recipientAddress),
        )

        if (accountExists) {
            alias = accountExists.alias
        }

        const contactExists = contactsState.contacts.find(contact =>
            AddressUtils.compareAddresses(contact.address, recipientAddress),
        )

        if (contactExists) {
            alias = contactExists.alias
        }

        dispatch(
            upsertRecentContact({
                selectedAccountAddress: selectedAccountAddress,
                genesisId,
                contact: { address: recipientAddress, alias: alias, timestamp },
            }),
        )
    }

export { addContact, createContact, createRecentContact, editContact, removeContact }
