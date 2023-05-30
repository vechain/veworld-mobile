import React, { memo, useCallback, useMemo, useState } from "react"
import { usePasswordValidation } from "~Common"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    NumPad,
    PasswordPins,
} from "~Components"
import { useI18nContext } from "~i18n"
import { LOCKSCREEN_SCENARIO } from "./Enums"
import { useOnDigitPress } from "./useOnDigitPress"
import { PinVerificationError, PinVerificationErrorType } from "~Model"

type Props = {
    onSuccess: (password: string) => void
    scenario: LOCKSCREEN_SCENARIO
    isValidatePassword?: boolean
}

type Titles = {
    title: string
    subTitle: string
}

const digitNumber = 6

export const LockScreen: React.FC<Props> = memo(
    ({ onSuccess, scenario, isValidatePassword = true }) => {
        const { LL } = useI18nContext()

        const { validatePassword } = usePasswordValidation()

        const [isError, setIsError] = useState<PinVerificationErrorType>({
            type: undefined,
            value: false,
        })

        const isOldPinSameAsNewPin = useCallback(
            async (pin: string) => {
                /*
                    If this (isValidatePassword) prop is false means that the user is trying to 
                    edit an existing pin, so we need to validate that the new pin is not the same as the old one.
                    If "validatePassword()" succeeeds means that the new pin is the same as the old one and
                    we can throw an error
                */

                const isValid = await validatePassword(pin)
                if (isValid) {
                    setIsError({
                        type: PinVerificationError.EDIT_PIN,
                        value: true,
                    })
                } else {
                    onSuccess(pin)
                    return
                }
            },
            [onSuccess, validatePassword],
        )

        /**
         * Called by `useOnDigitPress` when the user has finished typing the pin
         * Validates the user pin and calls `onSuccess` if the pin is valid
         * otherwise sets `isError` to true
         */
        const validateUserPin = useCallback(
            async (userPin: string) => {
                if (!isValidatePassword) {
                    await isOldPinSameAsNewPin(userPin)
                    return
                }

                const isValid = await validatePassword(userPin)

                if (isValid) onSuccess(userPin)
                else {
                    setIsError({
                        type: PinVerificationError.VALIDATE_PIN,
                        value: true,
                    })
                }
            },
            [
                isOldPinSameAsNewPin,
                isValidatePassword,
                onSuccess,
                validatePassword,
            ],
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
                        subTitle: LL.SB_EDIT_NEW_PIN(),
                    }

                default:
                    return {
                        title: LL.TITLE_USER_PIN(),
                        subTitle: LL.SB_UNLOCK_WALLET_PIN(),
                    }
            }
        }, [LL, scenario])

        return (
            <BaseSafeArea grow={1}>
                <BaseSpacer height={20} />
                <BaseView mx={20} alignItems="center">
                    <BaseView alignSelf="flex-start">
                        <BaseText typographyFont="title">{title}</BaseText>

                        <BaseText typographyFont="body" my={10}>
                            {subTitle}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={62} />
                    <PasswordPins
                        digitNumber={digitNumber}
                        pin={pin}
                        isPinError={isError}
                    />
                    <NumPad
                        onDigitPress={handleOnDigitPress}
                        onDigitDelete={onDigitDelete}
                    />
                </BaseView>

                <BaseSpacer height={40} />
            </BaseSafeArea>
        )
    },
)
