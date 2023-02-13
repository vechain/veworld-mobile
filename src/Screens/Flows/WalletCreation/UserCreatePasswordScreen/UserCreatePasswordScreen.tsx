import React, { useEffect, useMemo } from "react"
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
import { Fonts, WALLET_STATUS } from "~Model"
import { useCreateWalletWithPassword } from "~Common"
import {
    AppLock,
    Config,
    RealmClass,
    useCache,
    useStore,
    useStoreQuery,
} from "~Storage"

export const UserCreatePasswordScreen = () => {
    const { LL } = useI18nContext()
    const cache = useCache()
    const {
        isPinError,
        isPinRetype,
        onDigitPress,
        userPinArray,
        isSuccess,
        userPin,
    } = useOnDigitPress()
    const { onCreateWallet, isComplete } = useCreateWalletWithPassword()

    // todo: this is a workaround until the new version is installed, then use the above
    const result1 = useStoreQuery(Config)
    const config = useMemo(() => result1.sorted("_id"), [result1])

    const store = useStore()

    useEffect(() => {
        if (isSuccess) {
            onCreateWallet(userPin)
        }
    }, [isSuccess, onCreateWallet, userPin])

    useEffect(() => {
        if (isComplete) {
            cache.write(() => {
                let appLock = cache.objectForPrimaryKey<AppLock>(
                    RealmClass.AppLock,
                    "APP_LOCK",
                )
                if (appLock) {
                    appLock.status = WALLET_STATUS.UNLOCKED
                }
            })

            store.write(() => {
                config[0].isWalletCreated = true
            })
        }
    }, [cache, config, isComplete, store])

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
