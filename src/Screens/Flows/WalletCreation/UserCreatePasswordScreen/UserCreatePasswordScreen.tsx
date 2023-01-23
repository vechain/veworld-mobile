import React, { useEffect } from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useOnDigitPress } from "./useOnDigitPress"
import { PasswordPins } from "./Components/PasswordPins"
import { NumPad } from "./Components/NumPad"
import { Fonts } from "~Model"
import { selectMnemonic, useAppDispatch, useAppSelector } from "~Storage/Caches"
import { LocalWalletService } from "~Services"
import { useRealm } from "~Storage/Realm"

export const UserCreatePasswordScreen = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const realm = useRealm()
    const {
        isPinError,
        isPinRetype,
        onDigitPress,
        userPinArray,
        isSuccess,
        userPin,
    } = useOnDigitPress()

    const mnemonic = useAppSelector(selectMnemonic)

    useEffect(() => {
        if (isSuccess && mnemonic) {
            let isBiometrics = false

            dispatch(
                LocalWalletService.createMnemonicWallet(
                    LL.WALLET_LABEL_account(), // move to service?
                    mnemonic.split(" "),
                    realm,
                    isBiometrics,
                    userPin,
                ),
            )
        }
    }, [LL, dispatch, isSuccess, mnemonic, realm, userPin])

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
