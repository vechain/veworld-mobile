import React, { useEffect } from "react"
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
    primary: string
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
     *
     * @returns Titles object based on the `scenario` prop
     */
    const getTitles = (): Titles => {
        switch (scenario) {
            case LOCKSCREEN_SCENARIO.UNLOCK_WALLET:
                return {
                    primary: LL.TITLE_USER_PIN(),
                    subtitle: LL.SB_UNLOCK_WALLET_PIN(),
                }
            case LOCKSCREEN_SCENARIO.WALLET_CREATION:
                return {
                    primary: LL.TITLE_USER_PIN(),
                    subtitle: LL.SB_CONFIRM_PIN(),
                }
            default:
                return {
                    primary: LL.TITLE_USER_PIN(),
                    subtitle: LL.SB_CONFIRM_PIN(),
                }
        }
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText typographyFont="largeTitle">
                        {getTitles().primary}
                    </BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {getTitles().subtitle}
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
