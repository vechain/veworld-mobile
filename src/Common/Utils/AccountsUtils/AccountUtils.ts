import AddressUtils from "../AddressUtils"
import { Account, WalletAccount, Contact } from "~Model"

import Format from "../FormattingUtils"

/**
 * find account in:
 *  - visible accounts
 *  - known contacts
 *  - cached contacts
 *
 * @param address destination address
 * @param visibleAccounts visible accounts
 * @param knownContacts known contacts
 * @param cachedContacts cached contacts
 */
export const searchForAccount = (
    address: string,
    visibleAccounts: WalletAccount[],
    knownContacts: Contact[],
    cachedContacts: Contact[],
): Account | undefined => {
    const visibleAccount = visibleAccounts.find(c =>
        AddressUtils.compareAddresses(c.address, address),
    )
    if (visibleAccount) return visibleAccount

    const knownContact = knownContacts.find(a =>
        AddressUtils.compareAddresses(a.address, address),
    )
    if (knownContact) return knownContact

    const cachedContact = cachedContacts.find(a =>
        AddressUtils.compareAddresses(a.address, address),
    )
    if (cachedContact) return cachedContact
}

export const lookUpAccount = (
    address: string,
    lookupContacts: Account[],
): string => {
    // Search for the contact in lookup contacts
    const contact = lookupContacts.find(c =>
        AddressUtils.compareAddresses(c.address, address),
    )
    if (contact) return `${contact.alias}`

    return Format.humanAddress(address)
}
