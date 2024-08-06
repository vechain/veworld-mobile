import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseText, BaseView, WrapTranslation } from "~Components"
import { COLORS, valueToHP } from "~Constants"
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

    const getMessageText = useMemo(() => {
        if (isPINRetype) return LL.BD_USER_PASSWORD_CONFIRM()

        if (errorType === PinVerificationError.VALIDATE_PIN && errorValue)
            return (
                <WrapTranslation
                    message={LL.BD_USER_PASSWORD_ERROR()}
                    renderComponent={() => (
                        <BaseView justifyContent="center" alignItems="center" style={PasswordStyles.danferIcon}>
                            <BaseText color={COLORS.DARK_RED} fontSize={10}>
                                !
                            </BaseText>
                        </BaseView>
                    )}
                />
            )

        if (errorType === PinVerificationError.EDIT_PIN && errorValue) return LL.BD_USER_EDIT_PASSWORD_ERROR()

        return MESSAGE_FAKE_PLACEHOLDER
    }, [isPINRetype, LL, errorType, errorValue])

    const getMessageTextColor = useMemo(() => {
        if (isPINRetype) return COLORS.DARK_PURPLE
        if (isPinError) return COLORS.DARK_RED
        return undefined
    }, [isPINRetype, isPinError])

    const getPinMessage = useMemo(() => {
        return (
            <BaseText
                // eslint-disable-next-line react-native/no-inline-styles
                style={{ opacity: isPINRetype || errorValue ? 1 : 0 }}
                typographyFont="bodyAccent"
                alignContainer="center"
                color={getMessageTextColor}
                my={18}>
                {getMessageText}
            </BaseText>
        )
    }, [isPINRetype, errorValue, getMessageTextColor, getMessageText])

    return (
        <BaseView alignItems="center">
            <BaseView flexDirection="row" justifyContent="center">
                {Array.from(Array(_digitNumber).keys()).map((digit, idx) => {
                    const digitExist = pin[idx]
                    return (
                        <BaseView
                            key={digit}
                            mx={10}
                            style={[
                                PasswordStyles.pinBase,
                                ...(digitExist ? [PasswordStyles.pressed] : [PasswordStyles.notPressed]),
                            ]}
                        />
                    )
                })}
            </BaseView>

            {getPinMessage}
        </BaseView>
    )
})

const PasswordStyles = StyleSheet.create({
    pinBase: {
        width: valueToHP[12],
        height: valueToHP[12],
        borderRadius: 6,
    },
    pressed: {
        backgroundColor: COLORS.DARK_PURPLE,
    },
    notPressed: {
        backgroundColor: COLORS.DARK_PURPLE_DISABLED,
    },
    messageTextStyle: { opacity: 1 },
    danferIcon: {
        borderRadius: 16,
        height: 16,
        width: 16,
        borderWidth: 1,
        borderColor: COLORS.DARK_RED,
    },
})
