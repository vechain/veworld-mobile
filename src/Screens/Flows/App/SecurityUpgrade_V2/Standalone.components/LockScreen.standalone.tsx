import React, { memo, useCallback, useMemo, useState } from "react"
import { BaseSpacer, BaseText, BaseView, StorageEncryptionKeyHelper } from "~Components"
import { useOnDigitPress } from "~Hooks"
import { useI18nContext } from "~i18n"
import { PinVerificationError, PinVerificationErrorType } from "~Model"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"
import { PasswordPins } from "./PasswordPins.standalone"
import { COLORS, isSmallScreen } from "~Constants"
import { NumPad } from "./NumPad.standalone"

export type Props = {
    onSuccess: (password: string) => void
    scenario: LOCKSCREEN_SCENARIO
    isValidatePassword?: boolean
}

export type Titles = {
    title: string
    subTitle: string
}

const digitNumber = 6

export const LockScreen: React.FC<Props> = memo(({ onSuccess, scenario, isValidatePassword = true }) => {
    const { LL } = useI18nContext()

    const [firstPin, setFirstPin] = useState<string>()

    const [isError, setIsError] = useState<PinVerificationErrorType>({
        type: undefined,
        value: false,
    })

    const isOldPinSameAsNewPin = useCallback(
        async (pin: string) => {
            const isValid = await StorageEncryptionKeyHelper.validatePinCode(pin)
            if (isValid) {
                setIsError({
                    type: PinVerificationError.EDIT_PIN,
                    value: true,
                })
            } else {
                onSuccess(pin)
            }
        },
        [onSuccess],
    )

    const handleEditPin = useCallback(
        (userPin: string) => {
            //User has confirmed the pin code
            if (firstPin === userPin) return onSuccess(userPin)

            //User has entered the first pin
            if (!firstPin) return setFirstPin(userPin)

            //User entered a different confirmation
            setIsError({
                type: PinVerificationError.VALIDATE_PIN,
                value: true,
            })
        },
        [onSuccess, firstPin],
    )

    /**
     * Called by `useOnDigitPress` when the user has finished typing the pin
     * Validates the user pin and calls `onSuccess` if the pin is valid
     * otherwise sets `isError` to true
     */
    const validateUserPin = useCallback(
        async (userPin: string) => {
            if (scenario === LOCKSCREEN_SCENARIO.EDIT_NEW_PIN) {
                return handleEditPin(userPin)
            }

            /*
                    If this (isValidatePassword) prop is false means that the user is trying to
                    edit an existing pin, and we should not validate against the old password, but validate that the password is not the same.
                    If "validatePassword()" succeeeds means that the new pin is the same as the old one and
                    we can throw an error
                */
            if (!isValidatePassword) {
                await isOldPinSameAsNewPin(userPin)
                return
            }

            const isValid = await StorageEncryptionKeyHelper.validatePinCode(userPin)

            if (isValid) {
                onSuccess(userPin)
            } else {
                setIsError({
                    type: PinVerificationError.VALIDATE_PIN,
                    value: true,
                })
            }
        },
        [scenario, handleEditPin, isOldPinSameAsNewPin, isValidatePassword, onSuccess],
    )

    const { pin, onDigitPress, onDigitDelete } = useOnDigitPress({
        digitNumber,
        onFinishCallback: validateUserPin,
        resetPinOnFinishTimer: 300,
    })

    const handleOnDigitPress = useCallback(
        (digit: string) => {
            setIsError({ type: undefined, value: false })
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    /**
     * Sets `title` and `subtitle` based on the `scenario` prop
     */
    const { title, subTitle }: Titles = useMemo(() => {
        switch (scenario) {
            case LOCKSCREEN_SCENARIO.WALLET_CREATION:
                return {
                    title: LL.TITLE_USER_PIN(),
                    subTitle: LL.SB_CONFIRM_PIN(),
                }

            case LOCKSCREEN_SCENARIO.EDIT_OLD_PIN:
                return {
                    title: LL.TITLE_USER_PIN(),
                    subTitle: LL.SB_EDIT_OLD_PIN(),
                }

            case LOCKSCREEN_SCENARIO.EDIT_NEW_PIN:
                return {
                    title: LL.TITLE_USER_PIN(),
                    subTitle: firstPin ? LL.SB_EDIT_NEW_PIN_CONFIRM() : LL.SB_EDIT_NEW_PIN(),
                }

            default:
                return {
                    title: LL.TITLE_USER_PIN(),
                    subTitle: LL.SB_UNLOCK_WALLET_PIN(),
                }
        }
    }, [firstPin, LL, scenario])

    return (
        <BaseView flexGrow={1} bg={COLORS.LIGHT_GRAY}>
            <BaseSpacer height={20} />
            <BaseView mx={24} alignItems="center">
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="title">{title}</BaseText>
                    <BaseText typographyFont="body" my={10}>
                        {subTitle}
                    </BaseText>
                </BaseView>

                <BaseSpacer height={isSmallScreen ? 32 : 62} />

                <PasswordPins _digitNumber={digitNumber} pin={pin} isPinError={isError} />
                <NumPad onDigitPress={handleOnDigitPress} onDigitDelete={onDigitDelete} />
                <BaseSpacer height={60} />
            </BaseView>
        </BaseView>
    )
})
