import React, { FC, memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { AlertInline, BaseText, BaseView } from "~Components"
import { PinVerificationErrorType, PinVerificationError } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    pin: string[]
    digitNumber: number
    isPINRetype?: boolean
    isPinError: PinVerificationErrorType
}

const MESSAGE_FAKE_PLACEHOLDER = "placeholder"
export const PasswordPins: FC<Props> = memo(({ pin, digitNumber, isPINRetype, isPinError }) => {
    const { value: errorValue, type: errorType } = isPinError

    const { LL } = useI18nContext()

    const isMessageVisible = useMemo(() => {
        if (isPINRetype || errorValue) return true
        return false
    }, [errorValue, isPINRetype])

    const { styles: themedStyles, theme } = useThemedStyles(baseStyles(isMessageVisible))

    const getMessageText = useMemo(() => {
        if (isPINRetype)
            return (
                <AlertInline
                    message={LL.BD_USER_PASSWORD_CONFIRM()}
                    status={"neutral"}
                    variant={"inline"}
                    justifyContent="center"
                />
            )

        if (errorType === PinVerificationError.VALIDATE_PIN && errorValue)
            return (
                <AlertInline
                    message={LL.BD_USER_PASSWORD_ERROR()}
                    status={"error"}
                    variant={"inline"}
                    justifyContent="center"
                />
            )

        if (errorType === PinVerificationError.EDIT_PIN && errorValue)
            return (
                <AlertInline
                    message={LL.BD_USER_EDIT_PASSWORD_ERROR()}
                    status={"error"}
                    variant={"inline"}
                    justifyContent="center"
                />
            )

        return (
            <BaseText
                style={themedStyles.messageTextStyle}
                typographyFont="body"
                alignContainer="center"
                justifyContainer="center"
                color={theme.colors.subtitle}>
                {MESSAGE_FAKE_PLACEHOLDER}
            </BaseText>
        )
    }, [isPINRetype, LL, errorType, errorValue, themedStyles.messageTextStyle, theme.colors.subtitle])

    return (
        <BaseView alignItems="center" h={8} justifyContent={"space-between"}>
            <BaseView flexDirection="row" justifyContent="center">
                {Array.from(Array(digitNumber).keys()).map((digit, idx) => {
                    const digitExist = pin[idx]
                    return (
                        <BaseView
                            key={digit}
                            mx={8}
                            style={[
                                themedStyles.pinBase,
                                ...(digitExist ? [themedStyles.pressed] : [themedStyles.notPressed]),
                            ]}
                        />
                    )
                })}
            </BaseView>
            {getMessageText}
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
