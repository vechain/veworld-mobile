import React, { useEffect } from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useOnDigitPress } from "./useOnDigitPress"
import { PasswordPins } from "./Components/PasswordPins"
import { NumPad } from "./Components/NumPad"

export const UserPasswordScreen = () => {
    const { LL } = useI18nContext()
    const { IsPINErorr, IsPINRetype, onDigitPress, UserPinArray, IsSuccess } =
        useOnDigitPress()

    useEffect(() => {
        if (IsSuccess) {
            // secure wallet & navigate
        }
    }, [IsSuccess])

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
                    UserPinArray={UserPinArray}
                    isPINRetype={IsPINRetype}
                    isPINErorr={IsPINErorr}
                />
                <NumPad onDigitPress={onDigitPress} />
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
