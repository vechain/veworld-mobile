import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { AlertInline, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { PinVerificationError, PinVerificationErrorType } from "~Model"

export type PasswordPinsProps = {
    pin: string[]
    _digitNumber: number
    isPINRetype?: boolean
    isPinError: PinVerificationErrorType
}

const MESSAGE_FAKE_PLACEHOLDER = "placeholder"

export const PasswordPins = memo(({ pin, _digitNumber, isPINRetype, isPinError }: PasswordPinsProps) => {
    const { value: errorValue, type: errorType } = isPinError
    const { LL } = useI18nContext()

    const isMessageVisible = useMemo(() => {
        return isPINRetype || errorValue
    }, [errorValue, isPINRetype])

    const { styles, theme } = useThemedStyles(baseStyles(isMessageVisible))

    const getMessageText = useMemo(() => {
        if (isPINRetype)
            return <AlertInline message={LL.BD_USER_PASSWORD_CONFIRM()} status={"neutral"} variant={"inline"} />

        if (errorType === PinVerificationError.EDIT_PIN && errorValue)
            return <AlertInline message={LL.BD_USER_EDIT_PASSWORD_ERROR()} status={"error"} variant={"inline"} />

        if (errorType === PinVerificationError.VALIDATE_PIN && errorValue)
            return <AlertInline message={LL.BD_USER_PASSWORD_ERROR()} status={"error"} variant={"inline"} />

        return MESSAGE_FAKE_PLACEHOLDER
    }, [isPINRetype, LL, errorType, errorValue])

    const getPinMessage = useMemo(() => {
        return (
            <BaseText
                style={styles.messageTextStyle}
                typographyFont="body"
                alignContainer="center"
                color={theme.colors.subtitle}>
                {getMessageText}
            </BaseText>
        )
    }, [styles.messageTextStyle, theme.colors.subtitle, getMessageText])

    return (
        <BaseView alignItems="center" h={8} justifyContent={"space-between"}>
            <BaseView flexDirection="row" justifyContent="center">
                {Array.from(Array(_digitNumber).keys()).map((digit, idx) => {
                    const digitExist = pin[idx]
                    return (
                        <BaseView
                            key={digit}
                            mx={8}
                            style={[styles.pinBase, ...(digitExist ? [styles.pressed] : [styles.notPressed])]}
                        />
                    )
                })}
            </BaseView>

            {getPinMessage}
        </BaseView>
    )
})

const baseStyles = (isMessageVisible: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        pinBase: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        pressed: {
            backgroundColor: theme.colors.pinFilled,
        },
        notPressed: {
            backgroundColor: theme.colors.pinEmpty,
        },
        messageTextStyle: { opacity: isMessageVisible ? 1 : 0 },
    })
