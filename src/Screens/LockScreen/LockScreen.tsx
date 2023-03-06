import React, { useEffect } from "react"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    NumPad,
    PasswordPins,
} from "~Components"
import { useOnDigitPress } from "./useOnDigitPress"

type Props = {
    onSuccess: (password: string) => void
    title: string
    subTitle: string
}

export const LockScreen: React.FC<Props> = (props: Props) => {
    const { onSuccess, title, subTitle } = props

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
            <BaseView mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText typographyFont="largeTitle">{title}</BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {subTitle}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={62} />
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
