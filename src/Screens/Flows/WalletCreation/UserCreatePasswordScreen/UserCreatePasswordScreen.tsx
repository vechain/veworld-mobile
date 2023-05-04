import React, { useCallback, useState } from "react"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    PasswordPins,
    NumPad,
} from "~Components"
import { useI18nContext } from "~i18n"
import { SecurityLevelType } from "~Model"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { useOnDigitPressWithConfirmation } from "./useOnDigitPressWithConfirmation"
import { CryptoUtils, SettingsConstants } from "~Common"
import { useAppDispatch } from "~Storage/Redux"
import { setPinValidationString } from "~Storage/Redux/Actions"
import { heightPercentageToDP as hp } from "react-native-responsive-screen"

const digitNumber = 6
export const UserCreatePasswordScreen = () => {
    const { LL } = useI18nContext()

    const nav = useNavigation()
    const dispatch = useAppDispatch()

    /**
     * Called by `useOnDigitPressWithConfirmation` when the user has finished typing the pin
     * Store the encrypted pin validation string in the redux store
     * and navigate to the success screen
     */
    const onFinishCallback = useCallback(
        (insertedPin: string) => {
            const pinValidationString = CryptoUtils.encrypt<string>(
                SettingsConstants.VALIDATION_STRING,
                insertedPin,
            )
            dispatch(setPinValidationString(pinValidationString))
            nav.navigate(Routes.WALLET_SUCCESS, {
                securityLevelSelected: SecurityLevelType.SECRET,
                userPin: insertedPin,
            })
        },
        [nav, dispatch],
    )

    const [isConfirmationError, setIsConfirmationError] =
        useState<boolean>(false)

    const { pin, isPinRetype, onDigitPress, onDigitDelete } =
        useOnDigitPressWithConfirmation({
            digitNumber,
            onFinishCallback,
            onConfirmationError: () => setIsConfirmationError(true),
        })

    const handleOnDigitPress = useCallback(
        (digit: string) => {
            setIsConfirmationError(false)
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView
                alignItems="center"
                justifyContent="flex-start"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="largeTitle">
                        {LL.TITLE_USER_PASSWORD()}
                    </BaseText>
                    {/* TODO: change this lorem ipsum */}
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <BaseText typographyFont="body" my={10}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </BaseText>
                </BaseView>
                <BaseSpacer height={hp("7%")} />
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

            <BaseSpacer height={hp("4.69%")} />
        </BaseSafeArea>
    )
}
