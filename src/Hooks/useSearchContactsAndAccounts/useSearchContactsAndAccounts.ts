import { useMemo } from "react"
import {
    selectKnownContacts,
    selectVisibleAccountsButSelected,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useSearchContactsAndAccounts = ({
    searchText,
    selectedAddress,
}: {
    searchText: string
    selectedAddress: string | undefined
}) => {
    const accounts = useAppSelector(selectVisibleAccountsButSelected)
    const contacts = useAppSelector(selectKnownContacts)
    const accountsAndContacts = useMemo(() => {
        return [...accounts, ...contacts]
    }, [accounts, contacts])

    const filteredContacts = useMemo(() => {
        if (!searchText) return contacts
        return contacts.filter(
            contact =>
                (!!selectedAddress &&
                    AddressUtils.compareAddresses(
                        contact.address,
                        selectedAddress,
                    )) ||
                contact.alias
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                contact.address
                    .toLowerCase()
                    .includes(searchText.toLowerCase()),
        )
    }, [selectedAddress, contacts, searchText])

    const filteredAccounts = useMemo(() => {
        if (!searchText) return accounts
        return accounts.filter(
            account =>
                (!!selectedAddress &&
                    AddressUtils.compareAddresses(
                        account.address,
                        selectedAddress,
                    )) ||
                account.alias
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                account.address
                    .toLowerCase()
                    .includes(searchText.toLowerCase()),
        )
    }, [selectedAddress, accounts, searchText])

    const isAddressInContactsOrAccounts = useMemo(() => {
        if (!selectedAddress) return false
        return accountsAndContacts.some(accountOrContact =>
            AddressUtils.compareAddresses(
                accountOrContact.address,
                selectedAddress,
            ),
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
