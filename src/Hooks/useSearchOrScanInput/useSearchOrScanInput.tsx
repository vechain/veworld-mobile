import { isEmpty } from "lodash"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseTextInput, showWarningToast } from "~Components"
import { ScanTarget } from "~Constants"
import { useCameraBottomSheet } from "~Hooks/useCameraBottomSheet"
import { ScanFunctionRegistry } from "~Hooks/useScanTargets"
import { useVnsScanTarget } from "~Hooks/useScanTargets/useVnsScanTarget"
import { useSearchContactsAndAccounts } from "~Hooks/useSearchContactsAndAccounts"
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

    const { filteredContacts, filteredAccounts, isAddressInContactsOrAccounts, accountsAndContacts, contacts } =
        useSearchContactsAndAccounts({ searchText, selectedAddress })

    const onScanVns = useCallback<ScanFunctionRegistry["vns"]>(
        async (data, defaultFn) => {
            const res = await defaultFn(data)
            if (!res) {
                showWarningToast({ text1: LL.NOTIFICATION_DOMAIN_NAME_NOT_FOUND() })
                return false
            }
            setSearchText(res.name)
            setSelectedAddress(res.address)
            const addressExists = accountsAndContacts.some(accountOrContact =>
                AddressUtils.compareAddresses(accountOrContact.address, res.address),
            )
            if (addressExists) {
                navigateNext(res.address)
            }
            //Return true even if the address doesn't exist
            return true
        },
        [LL, accountsAndContacts, navigateNext, setSelectedAddress],
    )

    const vnsScanDefault = useVnsScanTarget()

    const onScanAddress = useCallback<ScanFunctionRegistry["address"]>(
        async address => {
            const vnsRes = await vnsScanDefault(address)
            const name = vnsRes?.name ?? ""

            setSearchText(isEmpty(name) ? address : name)
            setSelectedAddress(address)

            const addressExists = accountsAndContacts.some(accountOrContact =>
                AddressUtils.compareAddresses(accountOrContact.address, address),
            )

            if (addressExists) {
                navigateNext(address)
            }
            return true
        },
        [accountsAndContacts, navigateNext, setSelectedAddress, vnsScanDefault],
    )

    const { RenderCameraModal, handleOpenOnlyScanCamera } = useCameraBottomSheet({
        onScanVns,
        onScanAddress,
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

    const BaseTextInputElement = useMemo(
        () => (
            <BaseTextInput
                containerStyle={baseStyles.inputContainer}
                value={searchText}
                setValue={handleSearchChange}
                placeholder={LL.SEND_ENTER_AN_ADDRESS()}
                errorMessage={errorMessage}
                testID="InsertAddressSendScreen_addressInput"
                rightIcon={searchText ? "icon-x" : "icon-qr-code"}
                onIconPress={searchText ? onTextReset : handleOpenOnlyScanCamera}
            />
        ),
        [LL, errorMessage, handleOpenOnlyScanCamera, handleSearchChange, onTextReset, searchText],
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
