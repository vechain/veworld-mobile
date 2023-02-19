import React, { useEffect } from "react"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    PasswordPins,
    NumPad,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useOnDigitPress } from "./useOnDigitPress"
import { Fonts, SecurityLevelType } from "~Model"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"

export const UserCreatePasswordScreen = () => {
    const { LL } = useI18nContext()
    const {
        isPinError,
        isPinRetype,
        onDigitPress,
        userPinArray,
        isSuccess,
        userPin,
    } = useOnDigitPress()
    const nav = useNavigation()

    useEffect(() => {
        if (isSuccess) {
            nav.navigate(Routes.WALLET_SUCCESS, {
                securityLevelSelected: SecurityLevelType.SECRET,
                userPin,
            })
        }
    }, [isSuccess, nav, userPin])

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
