import React, { useCallback, useState } from "react"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    PasswordPins,
    NumPad,
    BackButtonHeader,
} from "~Components"
import { useI18nContext } from "~i18n"
import {
    PinVerificationError,
    PinVerificationErrorType,
    SecurityLevelType,
} from "~Model"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { useOnDigitPressWithConfirmation } from "./useOnDigitPressWithConfirmation"
import { usePasswordValidation, valueToHP } from "~Common"

const digitNumber = 6
export const UserCreatePasswordScreen = () => {
    const { LL } = useI18nContext()
    const { updatePassword } = usePasswordValidation()
    const nav = useNavigation()

    /**
     * Called by `useOnDigitPressWithConfirmation` when the user has finished typing the pin
     * Store the encrypted pin validation string in the redux store
     * and navigate to the success screen
     */
    const onFinishCallback = useCallback(
        async (insertedPin: string) => {
            await updatePassword(insertedPin)
            nav.navigate(Routes.WALLET_SUCCESS, {
                securityLevelSelected: SecurityLevelType.SECRET,
                userPin: insertedPin,
            })
        },
        [updatePassword, nav],
    )

    const [isConfirmationError, setIsConfirmationError] =
        useState<PinVerificationErrorType>({ type: undefined, value: false })

    const { pin, isPinRetype, onDigitPress, onDigitDelete } =
        useOnDigitPressWithConfirmation({
            digitNumber,
            onFinishCallback,
            onConfirmationError: () =>
                setIsConfirmationError({
                    type: PinVerificationError.VALIDATE_PIN,
                    value: true,
                }),
        })

    const handleOnDigitPress = useCallback(
        (digit: string) => {
            setIsConfirmationError({ type: undefined, value: false })
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView
                alignItems="center"
                justifyContent="flex-start"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="title">
                        {LL.TITLE_USER_PASSWORD()}
                    </BaseText>
                    {/* TODO: change this lorem ipsum */}
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <BaseText typographyFont="body" my={10}>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry
                    </BaseText>
                </BaseView>
                <BaseSpacer height={valueToHP[60]} />
                <PasswordPins
                    pin={pin}
                    digitNumber={digitNumber}
                    isPINRetype={isPinRetype}
                    isPinError={isConfirmationError}
                />
                <NumPad
                    onDigitPress={handleOnDigitPress}
                    onDigitDelete={onDigitDelete}
                />
            </BaseView>

            <BaseSpacer height={valueToHP[40]} />
        </BaseSafeArea>
    )
}
