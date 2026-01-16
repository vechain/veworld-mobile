import React, { useCallback, useMemo, useState } from "react"
import { Animated, StyleSheet } from "react-native"
import { LinearTransition } from "react-native-reanimated"
import { BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { useVns } from "~Hooks/useVns"
import {
    selectAccounts,
    selectKnownContacts,
    selectRecentContacts,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { useSendContext } from "../Provider"
import { SendContent } from "../Shared"
import { KnownAddressesList } from "./Components/KnownAddressesList"
import { WalletAddressCard } from "./Components/WalletAddressCard"

const _ReceiverScreen = ({ address: selectedAddress, name }: { address: string | undefined; name?: string }) => {
    const { flowState, setFlowState, goToNext } = useSendContext()

    const [inputWalletAddress, setInputWalletAddress] = useState<string>(name ?? selectedAddress ?? "")
    const [listWalletAddresses, setListWalletAddresses] = useState<string>(selectedAddress ?? "")
    const [addressChangeCtx, setAddressChangeCtx] = useState<"recent" | "accounts" | "contacts" | null>(null)
    const [realAddress, setRealAddress] = useState(selectedAddress || "")
    const [isError, setIsError] = useState(false)
    const { styles } = useThemedStyles(baseStyles)

    const allAccounts = useAppSelector(selectAccounts)
    const currentAccount = useAppSelector(selectSelectedAccount)

    const accounts = useMemo(() => {
        return allAccounts.filter(account => !AddressUtils.compareAddresses(account.address, currentAccount?.address))
    }, [allAccounts, currentAccount?.address])
    const contacts = useAppSelector(selectKnownContacts)
    const recentContacts = useAppSelector(selectRecentContacts)

    const activeFilter = useMemo(() => {
        if (addressChangeCtx) return addressChangeCtx
        if (recentContacts.find(recentContact => AddressUtils.compareAddresses(recentContact.address, realAddress)))
            return "recent"
        if (accounts.find(account => AddressUtils.compareAddresses(account.address, realAddress))) return "accounts"
        if (contacts.find(contact => AddressUtils.compareAddresses(contact.address, realAddress))) return "contacts"
        return undefined
    }, [addressChangeCtx, recentContacts, accounts, contacts, realAddress])

    const handleAddressChange = useCallback(
        (source: "input" | "list", str: string, address: string, ctx?: "recent" | "accounts" | "contacts") => {
            if (source === "input") {
                setAddressChangeCtx(null)
                if (AddressUtils.compareAddresses(address, selectedAddress)) {
                    return
                }
                setInputWalletAddress(str)
                setListWalletAddresses("")
                setRealAddress(address)
            } else {
                setAddressChangeCtx(ctx ?? null)
                setListWalletAddresses(str)
                setInputWalletAddress("")
                setRealAddress(address)
                setIsError(false)
            }
        },
        [selectedAddress],
    )

    const disabled = useMemo(() => !realAddress || !AddressUtils.isValid(realAddress), [realAddress])

    const isTokenFlow = flowState.type === "token"

    const onInputAddressChange = useCallback(
        (str: string, address: string) => {
            handleAddressChange("input", str, address)
        },
        [handleAddressChange],
    )

    const onListAddressChange = useCallback(
        (address: string, ctx: "accounts" | "contacts" | "recent") =>
            handleAddressChange("list", address, address, ctx),
        [handleAddressChange],
    )

    const onNext = useCallback(() => {
        setFlowState(prev => ({ ...prev, address: realAddress }))
        goToNext()
    }, [goToNext, realAddress, setFlowState])

    return (
        <SendContent
            footer={
                <>
                    {isTokenFlow && <SendContent.Footer.Back />}
                    <SendContent.Footer.Next testID="ReceiverScreen_NextButton" action={onNext} disabled={disabled} />
                </>
            }>
            <SendContent.Container style={styles.root} layout={LinearTransition}>
                <Animated.View style={styles.body}>
                    <WalletAddressCard
                        value={activeFilter ? "" : inputWalletAddress}
                        address={realAddress}
                        onAddressChange={onInputAddressChange}
                        isError={isError}
                        setIsError={setIsError}
                    />
                    <KnownAddressesList
                        activeFilter={activeFilter}
                        selectedAddress={listWalletAddresses}
                        onAddressChange={onListAddressChange}
                    />
                </Animated.View>
            </SendContent.Container>
        </SendContent>
    )
}

export const ReceiverScreen = () => {
    const { flowState } = useSendContext()
    const selectedAddress = useMemo(() => flowState.address, [flowState.address])

    const { name: vnsName, isLoading } = useVns({
        address: selectedAddress ?? "",
        name: "",
    })

    if (!selectedAddress) return <_ReceiverScreen address={selectedAddress} />
    if (isLoading) return <BaseView flex={1} />

    return <_ReceiverScreen address={selectedAddress} name={vnsName || undefined} />
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
        },
        body: {
            flexDirection: "column",
            gap: 8,
            flex: 1,
        },
    })
