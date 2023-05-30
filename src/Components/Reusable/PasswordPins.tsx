import React, { FC, memo, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, useThemedStyles, valueToHP } from "~Common"
import { COLORS } from "~Common/Theme"
import { BaseText, BaseView } from "~Components"
import { PinVerificationErrorType } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    pin: string[]
    digitNumber: number
    isPINRetype?: boolean
    isPinError: PinVerificationErrorType
}

const MESSAGE_FAKE_PLACEHOLDER = "placeholder"
export const PasswordPins: FC<Props> = memo(
    ({ pin, digitNumber, isPINRetype, isPinError }) => {
        const { value: errorValue, type: errorType } = isPinError

        const { LL } = useI18nContext()

        const isMessageVisible = useMemo(() => {
            if (isPINRetype) return true
            if (errorValue) return true

            return false
        }, [errorValue, isPINRetype])

        const { styles: themedStyles, theme } = useThemedStyles(
            baseStyles(isMessageVisible),
        )

        const getMessageText = useMemo(() => {
            if (isPINRetype) return LL.BD_USER_PASSWORD_CONFIRM()

            if (errorType === "VALIDATE_PIN" && errorValue)
                return LL.BD_USER_PASSWORD_ERROR()

            if (errorType === "EDIT_PIN" && errorValue)
                return LL.BD_USER_EDIT_PASSWORD_ERROR()

            return MESSAGE_FAKE_PLACEHOLDER
        }, [LL, isPINRetype, errorValue, errorType])

        const getMessageTextColor = useMemo(() => {
            if (isPINRetype) return theme.colors.text
            if (isPinError) return theme.colors.danger
            return undefined
        }, [isPINRetype, isPinError, theme.colors.danger, theme.colors.text])

        const getPinMessage = useCallback(() => {
            return (
                <BaseText
                    style={themedStyles.messageTextStyle}
                    typographyFont="bodyAccent"
                    alignContainer="center"
                    color={getMessageTextColor}
                    my={16}>
                    {getMessageText}
                </BaseText>
            )
        }, [themedStyles.messageTextStyle, getMessageTextColor, getMessageText])

        return (
            <BaseView alignItems="center">
                <BaseView flexDirection="row" justifyContent="center">
                    {Array.from(Array(digitNumber).keys()).map((digit, idx) => {
                        const digitExist = pin[idx]
                        return (
                            <BaseView
                                key={digit}
                                mx={10}
                                style={[
                                    themedStyles.pinBase,
                                    ...(digitExist
                                        ? [themedStyles.pressed]
                                        : [themedStyles.notPressed]),
                                ]}
                            />
                        )
                    })}
                </BaseView>

                {getPinMessage()}
            </BaseView>
        )
    },
)

const baseStyles = (isMessageVisible: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        pinBase: {
            width: valueToHP[12],
            height: valueToHP[12],
            borderRadius: 6,
        },
        pressed: {
            backgroundColor: theme.colors.text,
        },
        notPressed: {
            backgroundColor: COLORS.DARK_PURPLE_DISABLED,
        },
        messageTextStyle: { opacity: isMessageVisible ? 1 : 0 },
    })
