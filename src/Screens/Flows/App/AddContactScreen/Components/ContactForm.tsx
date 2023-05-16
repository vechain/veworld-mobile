import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useState } from "react"
import { BaseSpacer, BaseTextInput } from "~Components"
import { Routes } from "~Navigation"

type Props = {
    titleName: string
    titleAddress: string
    nameError: string
    addressError: string
    placeholderName?: string
    placeholderAddress?: string
    valueName?: string
    valueAddress?: string
    nameFieldDisabled?: boolean
    addressFieldDisabled?: boolean
    checkTouched?: boolean
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
        nameFieldDisabled = false,
        addressFieldDisabled = false,
        checkTouched = true,
        setName,
        setAddress,
    }) => {
        // States to handle showing error message once the user decides to add a contact, not at first render
        const [nameTouched, setNameTouched] = useState(false)
        const [addressTouched, setAddressTouched] = useState(false)

        const nav = useNavigation()

        const onOpenCamera = useCallback(() => {
            setAddressTouched(true)
            nav.navigate(Routes.CAMERA, { onScan: setAddress })
        }, [nav, setAddress])

        const canShowNameError = checkTouched ? nameTouched : true

        const canShowAddressError = checkTouched ? addressTouched : true

        return (
            <>
                <BaseTextInput
                    placeholder={placeholderName}
                    label={titleName}
                    setValue={setName}
                    errorMessage={canShowNameError ? nameError : ""}
                    value={valueName}
                    onTouchStart={() => setNameTouched(true)}
                    editable={!nameFieldDisabled}
                    testID="contact-name-input"
                />

                <BaseSpacer height={16} />

                <BaseTextInput
                    placeholder={placeholderAddress}
                    label={titleAddress}
                    setValue={setAddress}
                    errorMessage={canShowAddressError ? addressError : ""}
                    value={valueAddress}
                    onTouchStart={() => setAddressTouched(true)}
                    rightIcon={!addressFieldDisabled ? "flip-horizontal" : ""}
                    onIconPress={onOpenCamera}
                    testID="contact-address-input"
                    editable={!addressFieldDisabled}
                />
            </>
        )
    },
)
