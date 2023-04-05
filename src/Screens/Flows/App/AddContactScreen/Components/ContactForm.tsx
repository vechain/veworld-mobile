import React, { memo, useState } from "react"
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

        return (
            <>
                <BaseTextInput
                    placeholder={placeholderName}
                    label={titleName}
                    setValue={setName}
                    errorMessage={nameTouched ? nameError : ""}
                    value={valueName}
                    onTouchStart={() => setNameTouched(true)}
                />

                <BaseSpacer height={7} />

                <BaseTextInput
                    placeholder={placeholderAddress}
                    label={titleAddress}
                    setValue={setAddress}
                    errorMessage={addressTouched ? addressError : ""}
                    value={valueAddress}
                    onTouchStart={() => setAddressTouched(true)}
                />
            </>
        )
    },
)
