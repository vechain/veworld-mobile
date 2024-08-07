import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { useVns, Vns } from "~Hooks/useVns"
import { AccountWithDevice, Contact, NETWORK_TYPE } from "~Model"
import { selectKnownContacts, selectOtherAccounts, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

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

            const _contacts = contacts.map(ctc => {
                const address = cachedAddresses.find(addr => AddressUtils.compareAddresses(ctc.address, addr.address))

                if (address) {
                    return {
                        ...ctc,
                        domain: address.name,
                    }
                }

                return ctc
            })

            const _accounts = accounts.map(acc => {
                const address = cachedAddresses.find(addr => AddressUtils.compareAddresses(acc.address, addr.address))

                if (address) {
                    return {
                        ...acc,
                        domain: address.name,
                    }
                }

                return acc
            })

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
