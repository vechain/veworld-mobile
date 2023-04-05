import React, { memo, useCallback, useState } from "react"
import { BaseSpacer, BaseTextInput } from "~Components"

type Props = {
    titleName: string
    titleAddress: string
    nameError: string
    addressError: string
    placeholderName?: string
    placeholderAddress?: string
    valueName?: string
    valueAddress?: string
    setName: (name: string) => void
    setAddress: (address: string) => void
}

export const ContactForm: React.FC<Props> = memo(
    ({
        titleName,
        titleAddress,
        nameError,
        addressError,
        placeholderName,
        placeholderAddress,
        valueName,
        valueAddress,
        setName,
        setAddress,
    }) => {
        // States to handle showing error message once the user decides to add a contact, not at first render
        const [nameTouched, setNameTouched] = useState(false)
        const [addressTouched, setAddressTouched] = useState(false)

        const handleNameChange = useCallback(
            (name: string) => {
                setName(name)
                if (!nameTouched) {
                    setNameTouched(true)
                }
            },
            [setName, nameTouched],
        )

        const handleAddressChange = useCallback(
            (address: string) => {
                setAddress(address)
                if (!addressTouched) {
                    setAddressTouched(true)
                }
            },
            [setAddress, addressTouched],
        )

        return (
            <>
                <BaseTextInput
                    placeholder={placeholderName}
                    label={titleName}
                    setValue={handleNameChange}
                    errorMessage={nameTouched ? nameError : ""}
                    value={valueName}
                />

                <BaseSpacer height={7} />

                <BaseTextInput
                    placeholder={placeholderAddress}
                    label={titleAddress}
                    setValue={handleAddressChange}
                    errorMessage={addressTouched ? addressError : ""}
                    value={valueAddress}
                />
            </>
        )
    },
)
