import React, { FC, memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, valueToHP, COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { BaseText, BaseView, WrapTranslation } from "~Components"
import { PinVerificationErrorType, PinVerificationError } from "~Model"
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
            if (isPINRetype || errorValue) return true
            return false
        }, [errorValue, isPINRetype])

        const { styles: themedStyles, theme } = useThemedStyles(
            baseStyles(isMessageVisible),
        )

        const getMessageText = useMemo(() => {
            if (isPINRetype) return LL.BD_USER_PASSWORD_CONFIRM()

            if (errorType === PinVerificationError.VALIDATE_PIN && errorValue)
                return (
                    <WrapTranslation
                        message={LL.BD_USER_PASSWORD_ERROR()}
                        renderComponent={() => (
                            <BaseView
                                justifyContent="center"
                                alignItems="center"
                                style={themedStyles.danferIcon}>
                                <BaseText
                                    color={theme.colors.danger}
                                    fontSize={10}>
                                    !
                                </BaseText>
                            </BaseView>
                        )}
                    />
                )

            if (errorType === PinVerificationError.EDIT_PIN && errorValue)
                return LL.BD_USER_EDIT_PASSWORD_ERROR()

            return MESSAGE_FAKE_PLACEHOLDER
        }, [
            isPINRetype,
            LL,
            errorType,
            errorValue,
            themedStyles.danferIcon,
            theme.colors.danger,
        ])

        const getMessageTextColor = useMemo(() => {
            if (isPINRetype) return theme.colors.text
            if (isPinError) return theme.colors.danger
            return undefined
        }, [isPINRetype, isPinError, theme.colors.danger, theme.colors.text])

        const getPinMessage = useMemo(() => {
            return (
                <BaseText
                    style={themedStyles.messageTextStyle}
                    typographyFont="bodyAccent"
                    alignContainer="center"
                    color={getMessageTextColor}
                    my={18}>
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

                {getPinMessage}
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
        danferIcon: {
            borderRadius: 16,
            height: 16,
            width: 16,
            borderWidth: 1,
            borderColor: theme.colors.danger,
        },
    })
