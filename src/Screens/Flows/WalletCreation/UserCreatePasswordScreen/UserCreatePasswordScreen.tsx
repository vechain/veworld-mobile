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
import { SecurityLevelType } from "~Model"
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
            <BaseView
                alignItems="center"
                justifyContent="flex-start"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="largeTitle">
                        {LL.TITLE_USER_PASSWORD()}
                    </BaseText>

                    <BaseText typographyFont="body" my={10}>
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
