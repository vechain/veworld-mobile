import React, { useCallback, useEffect, useMemo, useState } from "react"
import { WalletAddressCard } from "./Components/WalletAddressCard"
import { useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { KnownAddressesList } from "./Components/KnownAddressesList"
import {
    selectAccounts,
    selectKnownContacts,
    selectRecentContacts,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"

type Props = {
    selectedAddress?: string
    onAddressChange: (address: string) => void
}

export const ReceiverScreen = ({ selectedAddress, onAddressChange }: Props) => {
    const [inputWalletAddress, setInputWalletAddress] = useState<string>("")
    const [listWalletAddresses, setListWalletAddresses] = useState<string>("")
    const { styles } = useThemedStyles(baseStyles)

    const allAccounts = useAppSelector(selectAccounts)
    const currentAccount = useAppSelector(selectSelectedAccount)

    const accounts = useMemo(() => {
        return allAccounts.filter(account => !AddressUtils.compareAddresses(account.address, currentAccount?.address))
    }, [allAccounts, currentAccount?.address])
    const contacts = useAppSelector(selectKnownContacts)
    const recentContacts = useAppSelector(selectRecentContacts)

    const activeFilter = useMemo(() => {
        if (accounts.find(account => AddressUtils.compareAddresses(account.address, selectedAddress))) return "accounts"
        if (contacts.find(contact => AddressUtils.compareAddresses(contact.address, selectedAddress))) return "contacts"
        if (recentContacts.find(recentContact => AddressUtils.compareAddresses(recentContact.address, selectedAddress)))
            return "recent"
        return undefined
    }, [selectedAddress, accounts, contacts, recentContacts])

    const handleAddressChange = useCallback(
        (source: "input" | "list", address: string) => {
            if (source === "input") {
                if (AddressUtils.compareAddresses(address, selectedAddress)) {
                    return
                }
                setInputWalletAddress(address)
                setListWalletAddresses("")
            } else {
                setListWalletAddresses(address)
                setInputWalletAddress("")
            }
            onAddressChange(address)
        },
        [onAddressChange, selectedAddress],
    )

    useEffect(() => {
        if (!activeFilter) {
            setInputWalletAddress(selectedAddress ?? "")
            setListWalletAddresses("")
            return
        }
        setListWalletAddresses(selectedAddress ?? "")
        setInputWalletAddress("")
    }, [selectedAddress, activeFilter])

    return (
        <Animated.View style={styles.root} layout={LinearTransition}>
            <WalletAddressCard
                selectedAddress={inputWalletAddress}
                onAddressChange={address => handleAddressChange("input", address)}
            />
            <KnownAddressesList
                activeFilter={activeFilter}
                selectedAddress={listWalletAddresses}
                onAddressChange={address => handleAddressChange("list", address)}
            />
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
            flexDirection: "column",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 24,
        },
    })
