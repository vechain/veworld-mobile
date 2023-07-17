import React, { useCallback, useMemo, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import { BaseTextInput } from "~Components"
import { useI18nContext } from "~i18n"

export const useSearchOrScanInput = ({
    openScanAddressSheet,
}: {
    openScanAddressSheet: () => void
}) => {
    const { LL } = useI18nContext()

    const [searchText, setSearchText] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const onTextReset = useCallback(() => {
        setSearchText("")
        setErrorMessage("")
    }, [])

    const handleSearchChange = useCallback((text: string) => {
        const lowerCaseText = text.toLowerCase()
        setErrorMessage("")
        setSearchText(lowerCaseText)
    }, [])

    const handleOnIconPress = useCallback(() => {
        Keyboard.dismiss()
        openScanAddressSheet()
    }, [openScanAddressSheet])

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
        [
            LL,
            errorMessage,
            handleOnIconPress,
            handleSearchChange,
            onTextReset,
            searchText,
        ],
    )

    return { BaseTextInputElement, searchText, setSearchText }
}

const baseStyles = StyleSheet.create({
    inputContainer: {
        width: "100%",
    },
})
