import React, { useEffect, useMemo } from "react"
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
    subtitle: string
}

export const LockScreen: React.FC<Props> = (props: Props) => {
    const { onSuccess, scenario } = props

    const { LL } = useI18nContext()

    const { isPinError, onDigitPress, userPinArray, isSuccess } =
        useOnDigitPress()

    useEffect(() => {
        if (isSuccess) {
            onSuccess(userPinArray.join(""))
        }
    }, [isSuccess, onSuccess, userPinArray])

    /**
     * Sets `title` and `subtitle` based on the `scenario` prop
     */
    const { title, subtitle }: Titles = useMemo(() => {
        switch (scenario) {
            case LOCKSCREEN_SCENARIO.UNLOCK_WALLET:
                return {
                    title: LL.TITLE_USER_PIN(),
                    subtitle: LL.SB_UNLOCK_WALLET_PIN(),
                }
            case LOCKSCREEN_SCENARIO.WALLET_CREATION:
                return {
                    title: LL.TITLE_USER_PIN(),
                    subtitle: LL.SB_CONFIRM_PIN(),
                }
        }
    }, [LL, scenario])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView mx={20}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="largeTitle">{title}</BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {subtitle}
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
