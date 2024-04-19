import React, { useCallback, useMemo, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import { BaseTextInput } from "~Components"
import { ScanTarget } from "~Constants"
import { useCameraBottomSheet } from "~Hooks/useCameraBottomSheet"
import { useSearchContactsAndAccounts } from "~Hooks/useSearchContactsAndAccounts"
import { useVns } from "~Hooks/useVns"
import { AddressUtils } from "~Utils"
import { useI18nContext } from "~i18n"

export const useSearchOrScanInput = (
    navigateNext: (address: string) => void,
    setSelectedAddress: React.Dispatch<React.SetStateAction<string>>,
    selectedAddress: string,
) => {
    const { LL } = useI18nContext()

    const [searchText, setSearchText] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const { _getName } = useVns({ name: "", address: "" })

    const { filteredContacts, filteredAccounts, isAddressInContactsOrAccounts, accountsAndContacts, contacts } =
        useSearchContactsAndAccounts({ searchText, selectedAddress })

    const onSuccessfullScan = useCallback(
        async (address: string) => {
            const addressExists = accountsAndContacts.some(accountOrContact =>
                AddressUtils.compareAddresses(accountOrContact.address, address),
            )

            const { name } = await _getName(address)
            setSearchText(name ?? address)
            setSelectedAddress(address)
            if (addressExists) return navigateNext(address)
        },
        [_getName, accountsAndContacts, navigateNext, setSelectedAddress],
    )

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        onScan: onSuccessfullScan,
        targets: [ScanTarget.ADDRESS],
    })

    const onTextReset = useCallback(() => {
        setSearchText("")
        setErrorMessage("")
    }, [])

    const handleSearchChange = useCallback((text: string) => {
        setErrorMessage("")
        setSearchText(text)
    }, [])

    const handleOnIconPress = useCallback(() => {
        Keyboard.dismiss()
        handleOpenCamera()
    }, [handleOpenCamera])

    const BaseTextInputElement = useMemo(
        () => (
            <BaseTextInput
                containerStyle={baseStyles.inputContainer}
                value={searchText}
                setValue={handleSearchChange}
                placeholder={LL.SEND_ENTER_AN_ADDRESS()}
                errorMessage={errorMessage}
                testID="InsertAddressSendScreen_addressInput"
                rightIcon={searchText ? "close" : "qrcode-scan"}
                onIconPress={searchText ? onTextReset : handleOnIconPress}
            />
        ),
        [LL, errorMessage, handleOnIconPress, handleSearchChange, onTextReset, searchText],
    )

    return {
        BaseTextInputElement,
        searchText,
        setSearchText,
        RenderCameraModal,
        filteredContacts,
        filteredAccounts,
        isAddressInContactsOrAccounts,
        contacts,
    }
}

const baseStyles = StyleSheet.create({
    inputContainer: {
        width: "100%",
    },
})
