import React, { memo, useCallback, useMemo, useState } from "react"
import { useAnalyticTracking, useOnDigitPress, useTheme } from "~Hooks"
import { BaseSpacer, BaseText, BaseView, NumPad, PasswordPins, StorageEncryptionKeyHelper, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { LOCKSCREEN_SCENARIO } from "./Enums"
import { PinVerificationError, PinVerificationErrorType } from "~Model"
import { AnalyticsEvent, isSmallScreen } from "~Constants"

type Props = {
    onSuccess: (password: string) => void
    onBack?: () => void
    scenario: LOCKSCREEN_SCENARIO
    isValidatePassword?: boolean
    isSafeView?: boolean
}

type Titles = {
    title: string
    subTitle: string
}

const digitNumber = 6

export const LockScreen: React.FC<Props> = memo(({ onSuccess, onBack, scenario, isValidatePassword = true }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const track = useAnalyticTracking()

    const [firstPin, setFirstPin] = useState<string>()

    const [isError, setIsError] = useState<PinVerificationErrorType>({
        type: undefined,
        value: false,
    })

    const isOldPinSameAsNewPin = useCallback(
        async (pin: string) => {
            const isValid = await StorageEncryptionKeyHelper.validatePinCode({ pinCode: pin })
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
            if (firstPin === userPin) {
                /**
                 * If the new pin is equal to the old one, we should reset first pin
                 * to start over again the flow correctly (request old, request new, confirm new)
                 */
                if (LOCKSCREEN_SCENARIO.EDIT_NEW_PIN) {
                    setFirstPin(undefined)

                    setIsError({
                        type: PinVerificationError.EDIT_PIN,
                        value: true,
                    })
                }

                return onSuccess(userPin)
            }

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

            const isValid = await StorageEncryptionKeyHelper.validatePinCode({ pinCode: userPin })

            if (isValid) {
                track(AnalyticsEvent.APP_PIN_UNLOCKED)
                onSuccess(userPin)
            } else {
                track(AnalyticsEvent.APP_WRONG_PIN)
                setIsError({
                    type: PinVerificationError.VALIDATE_PIN,
                    value: true,
                })
            }
        },
        [scenario, handleEditPin, isOldPinSameAsNewPin, isValidatePassword, onSuccess, track],
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
        <Layout
            hasSafeArea={false}
            title={title}
            onBackButtonPress={onBack}
            body={
                <BaseView alignItems="center" justifyContent="flex-start">
                    <BaseText w={100} align="left" typographyFont="body" color={theme.colors.subtitle}>
                        {subTitle}
                    </BaseText>
                    <BaseSpacer height={isSmallScreen ? 45 : 80} />
                    <PasswordPins digitNumber={digitNumber} pin={pin} isPinError={isError} />
                    <BaseSpacer height={isSmallScreen ? 32 : 80} />
                    <NumPad onDigitPress={handleOnDigitPress} onDigitDelete={onDigitDelete} />
                </BaseView>
            }
        />
    )
})
