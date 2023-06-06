import React, { memo, useCallback, useMemo, useState } from "react"
import { useBottomSheetModal } from "~Common"
import {
    BaseBottomSheetTextInput,
    BaseSpacer,
    BaseTextInput,
    ScanAddressBottomSheet,
} from "~Components"

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

        const {
            ref: scanAddressSheetRef,
            onOpen: openScanAddressSheet,
            onClose: closeScanAddressSheetRef,
        } = useBottomSheetModal()

        const onOpenCamera = useCallback(() => {
            setAddressTouched(true)
            openScanAddressSheet()
        }, [openScanAddressSheet])

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
                setValue: setAddress,
                errorMessage: canShowAddressError ? addressError : "",
                value: valueAddress,
                onTouchStart: () => setAddressTouched(true),
                rightIcon: !addressFieldDisabled ? "flip-horizontal" : "",
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

                <ScanAddressBottomSheet
                    ref={scanAddressSheetRef}
                    onClose={closeScanAddressSheetRef}
                    onScan={setAddress}
                />
            </>
        )
    },
)
