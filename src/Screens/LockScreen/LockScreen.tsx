import React, { useEffect, useMemo } from "react"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    NumPad,
    PasswordPins,
} from "~Components"
import { Fonts, WALLET_STATUS } from "~Model"
import { AppLock, useCache, useCachedQuery } from "~Storage"
import { useI18nContext } from "~i18n"
import { useOnDigitPress } from "./useOnDigitPress"

export const LockScreen = () => {
    const { LL } = useI18nContext()
    const cache = useCache()

    // todo: this is a workaround until the new version is installed
    const result = useCachedQuery(AppLock)
    const appLock = useMemo(() => result.sorted("_id"), [result])

    const { isPinError, onDigitPress, userPinArray, isSuccess } =
        useOnDigitPress()

    useEffect(() => {
        if (isSuccess) {
            cache.write(() => {
                appLock[0].status = WALLET_STATUS.UNLOCKED
            })
        }
    }, [appLock, cache, isSuccess])

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
