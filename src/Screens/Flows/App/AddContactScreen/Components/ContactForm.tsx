import React, { memo, useEffect, useMemo } from "react"
import { BaseSpacer, BaseTextInput } from "~Components"

type Props = {
    placeholderName: string
    placeholderAddress: string
    titleName: string
    titleAddress: string
    name: string
    address: string
    setName: (name: string) => void
    setAddress: (address: string) => void
    setIsValidForm: (isValid: boolean) => void
    validateName: (name: string) => string
    validateAddress: (address: string) => string
}

export const ContactForm: React.FC<Props> = memo(
    ({
        placeholderName,
        placeholderAddress,
        titleName,
        titleAddress,
        name,
        address,
        setName,
        setAddress,
        setIsValidForm,
        validateName,
        validateAddress,
    }) => {
        const { nameError, addressError } = useMemo(() => {
            return {
                nameError: validateName(name),
                addressError: validateAddress(address),
            }
        }, [validateName, name, validateAddress, address])

        useEffect(() => {
            if (nameError.length === 0 && addressError.length === 0)
                setIsValidForm(true)
            else setIsValidForm(false)
        }, [addressError.length, nameError.length, setIsValidForm])

        return (
            <>
                <BaseTextInput
                    placeholder={placeholderName}
                    label={titleName}
                    setValue={setName}
                    errorMessage={nameError}
                />

                <BaseSpacer height={7} />

                <BaseTextInput
                    placeholder={placeholderAddress}
                    label={titleAddress}
                    setValue={setAddress}
                    errorMessage={addressError}
                />
            </>
        )
    },
)
