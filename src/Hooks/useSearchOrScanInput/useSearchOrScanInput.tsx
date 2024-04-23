import { isEmpty } from "lodash"
import React, { useCallback, useMemo, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import { BaseTextInput, showWarningToast } from "~Components"
import { ScanTarget } from "~Constants"
import { useCameraBottomSheet } from "~Hooks/useCameraBottomSheet"
import { useSearchContactsAndAccounts } from "~Hooks/useSearchContactsAndAccounts"
import { useVns, ZERO_ADDRESS } from "~Hooks/useVns"
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
    const { _getName, _getAddress } = useVns({ name: "", address: "" })

    const { filteredContacts, filteredAccounts, isAddressInContactsOrAccounts, accountsAndContacts, contacts } =
        useSearchContactsAndAccounts({ searchText, selectedAddress })

    const onSuccessfullScan = useCallback(
        async (data: string) => {
            let vnsName = ""
            let vnsAddress = ""

            if (data.includes(".vet")) {
                const _addy = await _getAddress(data)

                if (_addy === ZERO_ADDRESS) {
                    showWarningToast({ text1: LL.NOTIFICATION_DOMAIN_NAME_NOT_FOUND() })
                    return
                }

                vnsAddress = _addy
                vnsName = data
            } else {
                const { name, address: vnsAddy } = await _getName(data)
                vnsName = name
                vnsAddress = vnsAddy
            }

            setSearchText(isEmpty(vnsName) ? vnsAddress : vnsName)
            setSelectedAddress(vnsAddress)

            const addressExists = accountsAndContacts.some(accountOrContact =>
                AddressUtils.compareAddresses(accountOrContact.address, vnsAddress),
            )

            if (addressExists) return navigateNext(vnsAddress)
        },
        [LL, _getAddress, _getName, accountsAndContacts, navigateNext, setSelectedAddress],
    )

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        onScan: onSuccessfullScan,
        targets: [ScanTarget.ADDRESS, ScanTarget.VNS],
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
