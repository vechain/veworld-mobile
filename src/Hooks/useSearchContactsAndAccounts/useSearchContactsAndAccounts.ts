import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { useVns, Vns } from "~Hooks/useVns"
import { AccountWithDevice, Contact, NETWORK_TYPE } from "~Model"
import { selectKnownContacts, selectOtherAccounts, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

const setContactsVns = (contacts: Contact[], cachedAddresses: Vns[]) => {
    return contacts.map(ctc => {
        const address = cachedAddresses.find(addr => AddressUtils.compareAddresses(ctc.address, addr.address))

        if (address) {
            return {
                ...ctc,
                vnsName: address.name,
            }
        }

        return ctc
    })
}
const setAccountsVns = (accounts: AccountWithDevice[], cachedAddresses: Vns[]) => {
    return accounts.map(account => {
        const address = cachedAddresses.find(addr => AddressUtils.compareAddresses(account.address, addr.address))

        if (address) {
            return {
                ...account,
                vnsName: address.name,
            }
        }

        return account
    })
}

export const useSearchContactsAndAccounts = ({
    searchText,
    selectedAddress,
}: {
    searchText: string
    selectedAddress: string | undefined
}) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const accounts = useAppSelector(selectOtherAccounts)
    const contacts = useAppSelector(selectKnownContacts)
    const accountsAndContacts = useMemo(() => {
        return [...accounts, ...contacts]
    }, [accounts, contacts])

    const qc = useQueryClient()

    const isOfficialNetwork = useMemo(
        () => selectedNetwork.type === NETWORK_TYPE.MAIN || selectedNetwork.type === NETWORK_TYPE.TEST,
        [selectedNetwork.type],
    )

    // START - [DOMAINS] we need to add the domain only for searching purposes
    const { getVnsName } = useVns()
    const [contactsWithDomain, setContactsWithDomain] = useState<Contact[]>([])
    const [accountsWithDomain, setAccountsWithDomain] = useState<AccountWithDevice[]>([])
    const firstLoad = useRef(true)

    useEffect(() => {
        const init = () => {
            firstLoad.current = false

            const cachedAddresses = qc.getQueryData<Vns[]>(["vns_names", selectedNetwork.genesis.id])
            if (!cachedAddresses) {
                setContactsWithDomain(contacts)
                setAccountsWithDomain(accounts)
                return
            }

            const _contacts = setContactsVns(contacts, cachedAddresses)
            const _accounts = setAccountsVns(accounts, cachedAddresses)

            setContactsWithDomain(_contacts)
            setAccountsWithDomain(_accounts)
        }

        // Avoid fetching VNS when not in MainNet or TestNet
        if (!isOfficialNetwork) {
            firstLoad.current = false
            setContactsWithDomain(contacts)
            setAccountsWithDomain(accounts)
            return
        }

        firstLoad.current && init()
    }, [getVnsName, accounts, contacts, isOfficialNetwork, selectedNetwork, qc])
    // END - [DOMAINS]

    const filteredContacts = useMemo(() => {
        if (!searchText) return contactsWithDomain
        return contactsWithDomain.filter(
            contact =>
                (!!selectedAddress && AddressUtils.compareAddresses(contact.address, selectedAddress)) ||
                contact.alias.toLowerCase().includes(searchText.toLowerCase()) ||
                contact.address.toLowerCase().includes(searchText.toLowerCase()) ||
                contact.vnsName?.toLowerCase().includes(searchText.toLowerCase()),
        )
    }, [selectedAddress, contactsWithDomain, searchText])

    const filteredAccounts = useMemo(() => {
        if (!searchText) return accountsWithDomain

        return accountsWithDomain.filter(
            account =>
                (!!selectedAddress && AddressUtils.compareAddresses(account.address, selectedAddress)) ||
                account.alias.toLowerCase().includes(searchText.toLowerCase()) ||
                account.address.toLowerCase().includes(searchText.toLowerCase()) ||
                account.vnsName?.toLowerCase().includes(searchText.toLowerCase()),
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
