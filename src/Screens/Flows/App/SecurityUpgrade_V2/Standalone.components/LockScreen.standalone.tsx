import React, { memo, useCallback, useMemo, useState } from "react"
import { BaseSpacer, BaseText, BaseView, Layout, StorageEncryptionKeyHelper } from "~Components"
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
        <Layout
            noBackButton
            title={title}
            body={
                <BaseView alignItems="center" justifyContent="flex-start">
                    <BaseText w={100} align="left" typographyFont="body" color={theme.colors.subtitle}>
                        {subTitle}
                    </BaseText>
                    <BaseSpacer height={80} />
                    <PasswordPins _digitNumber={digitNumber} pin={pin} isPinError={isError} />
                    <BaseSpacer height={80} />
                    <NumPad onDigitPress={handleOnDigitPress} onDigitDelete={onDigitDelete} />
                </BaseView>
            }
        />
    )
})
