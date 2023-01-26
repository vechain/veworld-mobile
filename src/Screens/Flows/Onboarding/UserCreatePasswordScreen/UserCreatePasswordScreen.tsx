import React, { useEffect } from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useOnDigitPress } from "./useOnDigitPress"
import { PasswordPins } from "./Components/PasswordPins"
import { NumPad } from "./Components/NumPad"
import { Fonts } from "~Model"
// import { useAppDispatch } from "~Storage/Caches"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

export const UserCreatePasswordScreen = () => {
    const { LL } = useI18nContext()
    // const dispatch = useAppDispatch()
    const nav = useNavigation()
    const {
        isPinError,
        isPinRetype,
        onDigitPress,
        userPinArray,
        isSuccess,
        // userPin,
    } = useOnDigitPress()

    useEffect(() => {
        if (isSuccess) {
            console.log("ENTER")
            nav.navigate(Routes.WALLET_TPYE_CREATION)
        }
    }, [isSuccess, nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="flex-start" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font={Fonts.large_title}>
                        {LL.TITLE_USER_PASSWORD()}
                    </BaseText>

                    <BaseText font={Fonts.body} my={10}>
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
