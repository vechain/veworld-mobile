import React, { useEffect } from "react"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    NumPad,
    PasswordPins,
} from "~Components"
import { Fonts } from "~Model"
import { useI18nContext } from "~i18n"
import { useOnDigitPress } from "./useOnDigitPress"

type Props = {
    onSuccess: (password: string) => void
}
export const LockScreen: React.FC<Props> = ({ onSuccess }) => {
    const { LL } = useI18nContext()

    const { isPinError, onDigitPress, userPinArray, isSuccess } =
        useOnDigitPress()

    useEffect(() => {
        if (isSuccess) {
            onSuccess(userPinArray.join(""))
        }
    }, [isSuccess, onSuccess, userPinArray])

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
                    isPinError={isPinError}
                />
                <NumPad onDigitPress={onDigitPress} />
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
