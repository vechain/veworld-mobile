import React, { memo, useCallback, useMemo, useState } from "react"
import { BaseSpacer, BaseText, BaseView, StorageEncryptionKeyHelper } from "~Components"
import { isSmallScreen } from "~Constants"
import { useOnDigitPress, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { PinVerificationError, PinVerificationErrorType } from "~Model"
import { NumPad } from "./NumPad.standalone"
import { PasswordPins } from "./PasswordPins.standalone"

export type Props = {
    onSuccess: (password: string) => void
}

export type Titles = {
    title: string
    subTitle: string
}

const digitNumber = 6

export const LockScreen: React.FC<Props> = memo(({ onSuccess }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const [isError, setIsError] = useState<PinVerificationErrorType>({
        type: undefined,
        value: false,
    })

    /**
     * Called by `useOnDigitPress` when the user has finished typing the pin
     * Validates the user pin and calls `onSuccess` if the pin is valid
     * otherwise sets `isError` to true
     */
    const validateUserPin = useCallback(
        async (userPin: string) => {
            const isLegacy = true
            const isValid = await StorageEncryptionKeyHelper.validatePinCode({ pinCode: userPin, isLegacy })

            if (isValid) {
                onSuccess(userPin)
            } else {
                setIsError({
                    type: PinVerificationError.VALIDATE_PIN,
                    value: true,
                })
            }
        },
        [onSuccess],
    )

    const { pin, onDigitPress, onDigitDelete } = useOnDigitPress({
        digitNumber,
        onFinishCallback: validateUserPin,
        resetPinOnFinishTimer: 300,
    })

    const handleOnDigitPress = useCallback(
        (digit: string) => {
            setIsError({ type: undefined, value: false })
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    const { title, subTitle }: Titles = useMemo(() => {
        return {
            title: LL.TITLE_USER_PIN(),
            subTitle: LL.SB_UNLOCK_WALLET_PIN(),
        }
    }, [LL])

    return (
        <BaseView flexGrow={1} bg={theme.colors.background}>
            <BaseSpacer height={20} />
            <BaseView mx={24} alignItems="center">
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="title">{title}</BaseText>
                    <BaseText typographyFont="body" my={10}>
                        {subTitle}
                    </BaseText>
                </BaseView>

                <BaseSpacer height={isSmallScreen ? 32 : 62} />

                <PasswordPins _digitNumber={digitNumber} pin={pin} isPinError={isError} />
                <NumPad onDigitPress={handleOnDigitPress} onDigitDelete={onDigitDelete} />
                <BaseSpacer height={60} />
            </BaseView>
        </BaseView>
    )
})
