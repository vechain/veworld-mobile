import React, { memo, useCallback, useMemo, useState } from "react"
import { useCameraBottomSheet } from "~Hooks"
import {
    BaseBottomSheetTextInput,
    BaseSpacer,
    BaseTextInput,
} from "~Components"
import { ScanTarget } from "~Constants"
import { Keyboard } from "react-native"
import HapticsService from "~Services/HapticsService"

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

        const onScan = useCallback(
            (uri: string) => {
                HapticsService.triggerImpact({ level: "Light" })
                setAddress(uri)
            },
            [setAddress],
        )

        const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
            onScan,
            target: ScanTarget.ADDRESS,
        })

        const onOpenCamera = useCallback(() => {
            Keyboard.dismiss()
            setAddressTouched(true)
            handleOpenCamera()
        }, [handleOpenCamera])

        const canShowNameError = checkTouched ? nameTouched : true

        const canShowAddressError = checkTouched ? addressTouched : true
        /**
         * Render one input or another based on inBottomsheet
         */
        const componentInputName = useMemo(() => {
            const commonProps = {
                placeholder: placeholderName,
                label: titleName,
                setValue: (name: string) => {
                    setName(name)
                    setNameTouched(true)
                },
                errorMessage: canShowNameError ? nameError : "",
                value: valueName,
                editable: !nameFieldDisabled,
                testID: "Contact-Name-Input",
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
                setValue: (address: string) => {
                    setAddress(address)
                    setAddressTouched(true)
                },
                errorMessage: canShowAddressError ? addressError : "",
                value: valueAddress,
                rightIcon: !addressFieldDisabled ? "qrcode-scan" : "",
                onIconPress: onOpenCamera,
                testID: "Contact-Address-Input",
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

                {RenderCameraModal}
            </>
        )
    },
)
