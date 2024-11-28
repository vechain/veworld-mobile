import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { forwardRef, useCallback, useEffect, useState } from "react"
import { FlatList, Keyboard } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import {
    AccountIcon,
    BaseBottomSheet,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseTouchable,
    BaseView,
    ContactCard,
    showWarningToast,
    useVeChat,
} from "~Components"
import { useTheme, useVns, ZERO_ADDRESS } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Contact } from "~Model"
import { selectContacts, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { humanAddress } from "~Utils/AddressUtils/AddressUtils"

type Props = {
    onClose: () => void
    onConfirm: (recipient: string, topic: string) => void
}

export const NewConversationBottomSheet = forwardRef<BottomSheetModalMethods, Props>(({ onClose, onConfirm }, ref) => {
    const [availableContacts, setAvailableContacts] = useState<Contact[]>([])
    const [seachValue, setSeachValue] = useState("")
    const [searchError, setSearchError] = useState("")
    const [filteredAddress, setFilteredAddress] = useState("")

    const contacts = useAppSelector(selectContacts)

    const { selectedClient } = useVeChat()
    const { getVnsAddress } = useVns()
    const { LL } = useI18nContext()
    const theme = useTheme()

    const filterAvailableContacts = useCallback(async () => {
        if (!selectedClient) return []

        const canMessageContacts = await selectedClient.canMessage(
            contacts.map(contact => contact.address.toLowerCase()),
        )
        const filteredAddresss = contacts.filter(contact => canMessageContacts[contact.address.toLowerCase()])
        setAvailableContacts(filteredAddresss)
    }, [contacts, selectedClient])

    const onSearch = useCallback((value: string) => {
        if (value === "") {
            setFilteredAddress("")
        }

        setSeachValue(value.toLowerCase())
        setSearchError("")
    }, [])

    const onSelectRecipient = useCallback(
        (contact?: Contact) => {
            if (!contact) {
                selectedClient?.conversations
                    .findOrCreateDm(filteredAddress)
                    .then(dm => onConfirm(filteredAddress, dm.topic))
                return
            }

            selectedClient?.conversations
                .findOrCreateDm(contact.address)
                .then(dm => onConfirm(contact.address, dm.topic))
        },
        [filteredAddress, onConfirm, selectedClient?.conversations],
    )

    const onDismissBottomSheet = useCallback(() => {
        setSeachValue("")
        setFilteredAddress("")
        setSearchError("")
        onClose()
    }, [onClose])

    useEffect(() => {
        filterAvailableContacts()
    }, [contacts, filterAvailableContacts, selectedClient])

    useEffect(() => {
        const init = async () => {
            if (seachValue && seachValue.includes(".vet")) {
                const address = await getVnsAddress(seachValue)

                if (address === ZERO_ADDRESS) {
                    showWarningToast({ text1: LL.NOTIFICATION_DOMAIN_NAME_NOT_FOUND() })
                    return
                }

                if (AddressUtils.isValid(address) && address) {
                    const canMessage = await selectedClient?.canMessage([address])
                    setFilteredAddress(canMessage && canMessage[address] ? address : "")
                    Keyboard.dismiss()
                }
            } else {
                if (seachValue.length === 42 && AddressUtils.isValid(seachValue)) {
                    const canMessage = await selectedClient?.canMessage([seachValue])
                    setFilteredAddress(canMessage && canMessage[seachValue] ? seachValue : "")
                    Keyboard.dismiss()
                }
            }
        }
        init()
    }, [LL, getVnsAddress, seachValue, selectedClient])

    const contactItem = ({ item }: { item: Contact }) => {
        return <ContactCard contact={item} onPress={() => onSelectRecipient(item)} />
    }

    return (
        <BaseBottomSheet ref={ref} enableDismissOnClose onDismiss={onDismissBottomSheet}>
            <BaseView>
                <BaseTextInput
                    placeholder={"Search an address or a contact"}
                    value={seachValue}
                    setValue={onSearch}
                    errorMessage={searchError}
                />
                <BaseSpacer height={16} />

                {filteredAddress && (
                    <>
                        <BaseText typographyFont="subSubTitleMedium">{"Search result"}</BaseText>

                        <BaseSpacer height={8} />

                        <BaseTouchable onPress={() => onSelectRecipient()}>
                            <BaseView flexDirection="row" bg={theme.colors.card} p={12} borderRadius={8}>
                                <AccountIcon address={filteredAddress} size={20} />
                                <BaseText mx={12}>{humanAddress(filteredAddress)}</BaseText>
                            </BaseView>
                        </BaseTouchable>
                    </>
                )}

                <BaseSpacer height={16} />
                <BaseText typographyFont="subSubTitleMedium">{"Contacts"}</BaseText>
                <BaseSpacer height={10} />
                <NestableScrollContainer>
                    <FlatList data={availableContacts} keyExtractor={item => item.address} renderItem={contactItem} />
                </NestableScrollContainer>

                <BaseSpacer height={16} />
            </BaseView>
        </BaseBottomSheet>
    )
})
