import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback, useMemo, useState } from "react"
import {
    BaseBottomSheetTextInput,
    BaseSpacer,
    BaseTextInput,
} from "~Components"
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
    inBottomSheet?: boolean
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
        inBottomSheet = false,
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
        /**
         * Render one input or another based on inBottomsheet
         */
        const componentInputName = useMemo(() => {
            const commonProps = {
                placeholder: placeholderName,
                label: titleName,
                setValue: setName,
                errorMessage: canShowNameError ? nameError : "",
                value: valueName,
                onTouchStart: () => setNameTouched(true),
                editable: !nameFieldDisabled,
                testID: "contact-name-input",
            }
            if (inBottomSheet)
                return <BaseBottomSheetTextInput {...commonProps} />
            return <BaseTextInput {...commonProps} />
        }, [
            inBottomSheet,
            nameFieldDisabled,
            valueName,
            nameError,
            titleName,
            placeholderName,
            setName,
            canShowNameError,
            setNameTouched,
        ])
        /**
         * Render one input or another based on inBottomsheet
         */
        const componentInputAddress = useMemo(() => {
            const commonProps = {
                placeholder: placeholderAddress,
                label: titleAddress,
                setValue: setAddress,
                errorMessage: canShowAddressError ? addressError : "",
                value: valueAddress,
                onTouchStart: () => setAddressTouched(true),
                rightIcon: !addressFieldDisabled ? "flip-horizontal" : "",
                onIconPress: onOpenCamera,
                testID: "contact-address-input",
                editable: !addressFieldDisabled,
            }

            if (inBottomSheet)
                return <BaseBottomSheetTextInput {...commonProps} />
            return <BaseTextInput {...commonProps} />
        }, [
            inBottomSheet,
            addressFieldDisabled,
            valueAddress,
            addressError,
            titleAddress,
            placeholderAddress,
            setAddress,
            canShowAddressError,
            setAddressTouched,
            onOpenCamera,
        ])

        return (
            <>
                {componentInputName}

                <BaseSpacer height={16} />

                {componentInputAddress}
            </>
        )
    },
)
