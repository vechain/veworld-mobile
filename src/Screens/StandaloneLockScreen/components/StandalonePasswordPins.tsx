import React, { FC, memo, useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { valueToHP, COLORS } from "~Constants"
import { WrapTranslation } from "~Components"
import { PinVerificationErrorType, PinVerificationError } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    pin: string[]
    digitNumber: number
    isPINRetype?: boolean
    isPinError: PinVerificationErrorType
}

const MESSAGE_FAKE_PLACEHOLDER = "placeholder"
export const StandalonePasswordPins: FC<Props> = memo(
    ({ pin, digitNumber, isPINRetype, isPinError }) => {
        const { value: errorValue, type: errorType } = isPinError

        const { LL } = useI18nContext()

        const isMessageVisible = useMemo(() => {
            if (isPINRetype || errorValue) return true
            return false
        }, [errorValue, isPINRetype])

        const valuedStyles = styles(isMessageVisible)

        const getMessageText = useMemo(() => {
            if (isPINRetype) return LL.BD_USER_PASSWORD_CONFIRM()

            if (errorType === PinVerificationError.VALIDATE_PIN && errorValue)
                return (
                    <WrapTranslation
                        message={LL.BD_USER_PASSWORD_ERROR()}
                        renderComponent={() => (
                            <View style={valuedStyles.messageContainer}>
                                <Text style={valuedStyles.messageText}>!</Text>
                            </View>
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
            valuedStyles.messageContainer,
            valuedStyles.messageText,
        ])

        const getMessageTextColor = useMemo(() => {
            if (isPINRetype) return COLORS.DARK_PURPLE
            if (isPinError) return COLORS.DARK_RED
            return undefined
        }, [isPINRetype, isPinError])

        const getPinMessage = useMemo(() => {
            return (
                <Text
                    style={[
                        valuedStyles.pinMessage,
                        { color: getMessageTextColor },
                    ]}>
                    {getMessageText}
                </Text>
            )
        }, [valuedStyles.pinMessage, getMessageTextColor, getMessageText])

        return (
            <View style={valuedStyles.container}>
                <View style={valuedStyles.innerContainer}>
                    {Array.from(Array(digitNumber).keys()).map((digit, idx) => {
                        const digitExist = pin[idx]
                        return (
                            <View
                                key={digit}
                                style={[
                                    valuedStyles.pinBase,
                                    ...(digitExist
                                        ? [valuedStyles.pressed]
                                        : [valuedStyles.notPressed]),
                                ]}
                            />
                        )
                    })}
                </View>

                {getPinMessage}
            </View>
        )
    },
)

const styles = (isMessageVisible: boolean) =>
    StyleSheet.create({
        container: {
            alignItems: "center",
        },
        innerContainer: {
            flexDirection: "row",
            justifyContent: "center",
        },
        messageContainer: {
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 16,
            height: 16,
            width: 16,
            borderWidth: 1,
            borderColor: COLORS.DARK_RED,
        },
        messageText: {
            color: COLORS.DARK_RED,
            fontSize: 10,
        },
        pinMessage: {
            opacity: isMessageVisible ? 1 : 0,
            fontSize: 16,
            fontWeight: "normal",
            alignItems: "center",
            marginVertical: 18,
        },
        pinBase: {
            width: valueToHP[12],
            height: valueToHP[12],
            borderRadius: 6,
            marginHorizontal: 10,
        },
        pressed: {
            backgroundColor: COLORS.DARK_PURPLE,
        },
        notPressed: {
            backgroundColor: COLORS.DARK_PURPLE_DISABLED,
        },
    })
