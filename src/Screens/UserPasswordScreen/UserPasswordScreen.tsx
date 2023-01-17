import React, { useEffect } from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useOnDigitPress } from "./useOnDigitPress"
import { PasswordPins } from "./Components/PasswordPins"
import { NumPad } from "./Components/NumPad"

export const UserPasswordScreen = () => {
    const { LL } = useI18nContext()
    const { isPinError, isPinRetype, onDigitPress, userPinArray, isSuccess } =
        useOnDigitPress()

    useEffect(() => {
        if (isSuccess) {
            // secure wallet & navigate
        }
    }, [isSuccess])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="flex-start" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font="large_title">
                        {LL.TITLE_USER_PASSWORD()}
                    </BaseText>

                    <BaseText font="body" my={10}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </BaseText>
                </BaseView>
                <BaseSpacer height={60} />
                <PasswordPins
                    UserPinArray={userPinArray}
                    isPINRetype={isPinRetype}
                    isPinError={isPinError}
                />
                <NumPad onDigitPress={onDigitPress} />
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
