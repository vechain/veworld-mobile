import { isEmpty } from "lodash"
import React, { useCallback, useMemo, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import { BaseTextInput, showWarningToast } from "~Components"
import { ScanTarget } from "~Constants"
import { useCameraBottomSheet } from "~Hooks/useCameraBottomSheet"
import { useSearchContactsAndAccounts } from "~Hooks/useSearchContactsAndAccounts"
import { useVns, ZERO_ADDRESS } from "~Hooks/useVns"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
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
    const network = useAppSelector(selectSelectedNetwork)
    const { getVnsName, getVnsAddress } = useVns()

    const { filteredContacts, filteredAccounts, isAddressInContactsOrAccounts, accountsAndContacts, contacts } =
        useSearchContactsAndAccounts({ searchText, selectedAddress })

    const fetchAccountVns = useCallback(
        async (data: string) => {
            let vnsName = ""
            let vnsAddress = ""

            if (data.includes(".vet")) {
                const addressFromVns = await getVnsAddress(data)

                if (addressFromVns === ZERO_ADDRESS) {
                    showWarningToast({ text1: LL.NOTIFICATION_DOMAIN_NAME_NOT_FOUND() })
                    return
                }

                vnsAddress = addressFromVns ?? ""
                vnsName = data
            } else {
                const [{ name }] = await getVnsName(data)
                vnsName = name ?? ""
                vnsAddress = data
            }

            return { name: vnsName, address: vnsAddress }
        },
        [LL, getVnsAddress, getVnsName],
    )

    const onSuccessfullScan = useCallback(
        async (data: string) => {
            let vnsName = ""
            let vnsAddress = ""

            const cachedVns = AddressUtils.loadVnsFromCache(data, network)

            // Load data from cache if present otherwise retrieve data
            if (cachedVns) {
                vnsName = cachedVns.name
                vnsAddress = cachedVns.address
            } else {
                const vns = await fetchAccountVns(data)
                vnsName = vns?.name || ""
                vnsAddress = vns?.address || ""
            }

            setSearchText(isEmpty(vnsName) ? vnsAddress : vnsName)
            setSelectedAddress(vnsAddress)

            const addressExists = accountsAndContacts.some(accountOrContact =>
                AddressUtils.compareAddresses(accountOrContact.address, vnsAddress),
            )

            if (addressExists) return navigateNext(vnsAddress)
        },
        [network, setSelectedAddress, accountsAndContacts, navigateNext, fetchAccountVns],
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
                rightIcon={searchText ? "icon-x" : "icon-qr-code"}
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
