import React, { useCallback, useEffect, useState } from "react"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    PasswordPins,
    NumPad,
    Layout,
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
import { useAnalyticTracking, usePasswordValidation } from "~Hooks"
import { AnalyticsEvent, valueToHP } from "~Constants"
import HapticsService from "~Services/HapticsService"

const digitNumber = 6
export const UserCreatePasswordScreen = () => {
    const { LL } = useI18nContext()
    const { updatePassword } = usePasswordValidation()
    const nav = useNavigation()
    const track = useAnalyticTracking()

    /**
     * Called by `useOnDigitPressWithConfirmation` when the user has finished typing the pin
     * Store the encrypted pin validation string in the redux store
     * and navigate to the success screen
     */
    const onFinishCallback = useCallback(
        async (insertedPin: string) => {
            await updatePassword(insertedPin)
            await HapticsService.triggerNotification({ level: "Success" })
            track(AnalyticsEvent.PASSWORD_SETUP_SUBMITTED)
            nav.navigate(Routes.WALLET_SUCCESS, {
                securityLevelSelected: SecurityLevelType.SECRET,
                userPin: insertedPin,
            })
        },
        [updatePassword, nav, track],
    )

    const [isConfirmationError, setIsConfirmationError] =
        useState<PinVerificationErrorType>({ type: undefined, value: false })

    const { pin, isPinRetype, onDigitPress, onDigitDelete } =
        useOnDigitPressWithConfirmation({
            digitNumber,
            onFinishCallback,
            onConfirmationError: async () => {
                await HapticsService.triggerNotification({ level: "Error" })
                setIsConfirmationError({
                    type: PinVerificationError.VALIDATE_PIN,
                    value: true,
                })
            },
        })

    const handleOnDigitPress = useCallback(
        async (digit: string) => {
            await HapticsService.triggerImpact({ level: "Light" })
            setIsConfirmationError({ type: undefined, value: false })
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    const handleOnDigitDelete = useCallback(async () => {
        await HapticsService.triggerNotification({ level: "Warning" })
        onDigitDelete()
    }, [onDigitDelete])

    useEffect(() => {
        track(AnalyticsEvent.PAGE_LOADED_SETUP_PASSWORD)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout
            body={
                <BaseView alignItems="center" justifyContent="flex-start">
                    <BaseView alignSelf="flex-start">
                        <BaseText typographyFont="title">
                            {LL.TITLE_USER_PASSWORD()}
                        </BaseText>
                        <BaseText typographyFont="body" my={10}>
                            {LL.SB_USER_PASSWORD()}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={valueToHP[40]} />
                    <PasswordPins
                        pin={pin}
                        digitNumber={digitNumber}
                        isPINRetype={isPinRetype}
                        isPinError={isConfirmationError}
                    />
                    <NumPad
                        onDigitPress={handleOnDigitPress}
                        onDigitDelete={handleOnDigitDelete}
                    />
                </BaseView>
            }
        />
    )
}
