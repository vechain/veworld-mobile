import React, { useCallback, useMemo, useState } from "react"
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

type Props = {
    onSuccess: (password: string) => void
    scenario: LOCKSCREEN_SCENARIO
}

type Titles = {
    title: string
    subTitle: string
}

const digitNumber = 6

export const LockScreen: React.FC<Props> = ({ onSuccess, scenario }) => {
    const { LL } = useI18nContext()

    const validatePassword = usePasswordValidation()

    const [isError, setIsError] = useState<boolean>(false)

    /**
     * Called by `useOnDigitPress` when the user has finished typing the pin
     * Validates the user pin and calls `onSuccess` if the pin is valid
     * otherwise sets `isError` to true
     *
     */
    const validateUserPin = useCallback(
        async (userPin: string) => {
            const isValid = await validatePassword(userPin)
            if (isValid) onSuccess(userPin)
            else {
                setIsError(true)
            }
        },
        [validatePassword, onSuccess],
    )

    const { pin, onDigitPress, onDigitDelete } = useOnDigitPress({
        digitNumber,
        onFinishCallback: validateUserPin,
        resetPinOnFinishTimer: 300,
    })

    const handleOnDigitPress = useCallback(
        (digit: string) => {
            setIsError(false)
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    /**
     * Sets `title` and `subtitle` based on the `scenario` prop
     */
    const { title, subTitle }: Titles = useMemo(() => {
        switch (scenario) {
            case LOCKSCREEN_SCENARIO.UNLOCK_WALLET:
                return {
                    title: LL.TITLE_USER_PIN(),
                    subTitle: LL.SB_UNLOCK_WALLET_PIN(),
                }
            case LOCKSCREEN_SCENARIO.WALLET_CREATION:
                return {
                    title: LL.TITLE_USER_PIN(),
                    subTitle: LL.SB_CONFIRM_PIN(),
                }
        }
    }, [LL, scenario])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView mx={20} alignItems="center">
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="largeTitle">{title}</BaseText>

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
}
