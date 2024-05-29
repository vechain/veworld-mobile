import { useEffect, useMemo, useRef, useState } from "react"
import { useVns } from "~Hooks/useVns"
import { AccountWithDevice, Contact } from "~Model"
import { selectKnownContacts, selectOtherAccounts, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useSearchContactsAndAccounts = ({
    searchText,
    selectedAddress,
}: {
    searchText: string
    selectedAddress: string | undefined
}) => {
    const accounts = useAppSelector(selectOtherAccounts)
    const contacts = useAppSelector(selectKnownContacts)
    const accountsAndContacts = useMemo(() => {
        return [...accounts, ...contacts]
    }, [accounts, contacts])

    // START - [DOMAINS] we need to add the domain only for searching purposes
    const { _getName } = useVns()
    const [contactsWithDomain, setContactsWithDomain] = useState<Contact[]>([])
    const [accountsWithDomain, setAccountsWithDomain] = useState<AccountWithDevice[]>([])
    const firstLoad = useRef(true)

    useEffect(() => {
        const init = async () => {
            firstLoad.current = false
            let _accounts: AccountWithDevice[] = []
            for (const acc of accounts) {
                const { name } = await _getName(acc.address)
                _accounts.push({ ...acc, domain: name })
            }

            let _contacts: Contact[] = []
            for (const acc of contacts) {
                const { name } = await _getName(acc.address)
                _contacts.push({ ...acc, domain: name })
            }

            setContactsWithDomain(_contacts)
            setAccountsWithDomain(_accounts)
        }

        firstLoad.current && init()
    }, [_getName, accounts, contacts])
    // END - [DOMAINS]

    const filteredContacts = useMemo(() => {
        if (!searchText) return contactsWithDomain
        return contactsWithDomain.filter(
            contact =>
                (!!selectedAddress && AddressUtils.compareAddresses(contact.address, selectedAddress)) ||
                contact.alias.toLowerCase().includes(searchText.toLowerCase()) ||
                contact.address.toLowerCase().includes(searchText.toLowerCase()) ||
                contact.domain?.toLowerCase().includes(searchText.toLowerCase()),
        )
    }, [selectedAddress, contactsWithDomain, searchText])

    const filteredAccounts = useMemo(() => {
        if (!searchText) return accountsWithDomain

        return accountsWithDomain.filter(
            account =>
                (!!selectedAddress && AddressUtils.compareAddresses(account.address, selectedAddress)) ||
                account.alias.toLowerCase().includes(searchText.toLowerCase()) ||
                account.address.toLowerCase().includes(searchText.toLowerCase()) ||
                account.domain?.toLowerCase().includes(searchText.toLowerCase()),
        )
    }, [selectedAddress, accountsWithDomain, searchText])

    const isAddressInContactsOrAccounts = useMemo(() => {
        if (!selectedAddress) return false
        return accountsAndContacts.some(accountOrContact =>
            AddressUtils.compareAddresses(accountOrContact.address, selectedAddress),
        )
    }, [accountsAndContacts, selectedAddress])

    return {
        filteredContacts,
        filteredAccounts,
        isAddressInContactsOrAccounts,
        accountsAndContacts,
        contacts,
    }
}
