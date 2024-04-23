import React, { memo, useCallback, useMemo, useState } from "react"
import { useCameraBottomSheet, useVns, ZERO_ADDRESS } from "~Hooks"
import { BaseBottomSheetTextInput, BaseSpacer, BaseTextInput, showWarningToast } from "~Components"
import { ScanTarget } from "~Constants"
import { Keyboard } from "react-native"
import HapticsService from "~Services/HapticsService"
import { isEmpty } from "lodash"
import { useI18nContext } from "~i18n"

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
        const { LL } = useI18nContext()

        // States to handle showing error message once the user decides to add a contact, not at first render
        const [nameTouched, setNameTouched] = useState(false)
        const [addressTouched, setAddressTouched] = useState(false)

        const { _getAddress } = useVns({ name: "", address: "" })

        const onScan = useCallback(
            async (uri: string) => {
                HapticsService.triggerImpact({ level: "Light" })

                let address = ""

                if (uri.includes(".vet")) {
                    address = await _getAddress(uri)
                    if (address === ZERO_ADDRESS) return

                    setAddress(address)
                } else {
                    setAddress(uri)
                }
            },
            [_getAddress, setAddress],
        )

        const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
            onScan,
            targets: [ScanTarget.ADDRESS, ScanTarget.VNS],
        })

        const onHandleIconTap = useCallback(() => {
            if (!isEmpty(valueAddress)) {
                setAddress("")
            } else {
                handleOpenCamera()
            }

            Keyboard.dismiss()
            setAddressTouched(true)
        }, [handleOpenCamera, setAddress, valueAddress])

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
            if (inBottomSheet) return <BaseBottomSheetTextInput {...commonProps} />
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

        const handleOnSetValue = useCallback(
            async (_address: string) => {
                let address = ""

                if (_address.includes(".vet")) {
                    const _addy = await _getAddress(_address)

                    if (_addy === ZERO_ADDRESS) {
                        showWarningToast({ text1: LL.NOTIFICATION_DOMAIN_NAME_NOT_FOUND() })
                        return
                    }

                    address = _addy
                    setAddress(address)
                    setAddressTouched(true)
                } else {
                    setAddress(_address)
                    setAddressTouched(true)
                }
            },
            [LL, _getAddress, setAddress],
        )

        /**
         * Render one input or another based on inBottomsheet
         */
        const componentInputAddress = useMemo(() => {
            const commonProps = {
                placeholder: placeholderAddress,
                label: titleAddress,
                setValue: (address: string) => handleOnSetValue(address),
                errorMessage: canShowAddressError ? addressError : "",
                value: valueAddress,
                rightIcon: isEmpty(valueAddress) ? "qrcode-scan" : "close",
                onIconPress: onHandleIconTap,
                testID: "Contact-Address-Input",
                editable: !addressFieldDisabled,
            }

            if (inBottomSheet) return <BaseBottomSheetTextInput {...commonProps} />
            return <BaseTextInput {...commonProps} />
        }, [
            placeholderAddress,
            titleAddress,
            canShowAddressError,
            addressError,
            valueAddress,
            addressFieldDisabled,
            onHandleIconTap,
            inBottomSheet,
            handleOnSetValue,
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
