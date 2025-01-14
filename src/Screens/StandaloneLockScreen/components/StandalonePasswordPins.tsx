import React, { FC, memo, useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { ColorThemeType } from "~Constants"
import { AlertInline } from "~Components"
import { PinVerificationErrorType, PinVerificationError } from "~Model"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"

type Props = {
    pin: string[]
    digitNumber: number
    isPINRetype?: boolean
    isPinError: PinVerificationErrorType
}

const MESSAGE_FAKE_PLACEHOLDER = "placeholder"
export const StandalonePasswordPins: FC<Props> = memo(({ pin, digitNumber, isPINRetype, isPinError }) => {
    const { value: errorValue, type: errorType } = isPinError

    const { LL } = useI18nContext()

    const isMessageVisible = useMemo(() => {
        if (isPINRetype || errorValue) return true
        return false
    }, [errorValue, isPINRetype])

    const { styles: themedStyles } = useThemedStyles(baseStyles(isMessageVisible))

    const getMessageText = useMemo(() => {
        if (isPINRetype)
            return <AlertInline message={LL.BD_USER_PASSWORD_CONFIRM()} status={"neutral"} variant={"inline"} />

        if (errorType === PinVerificationError.VALIDATE_PIN && errorValue)
            return <AlertInline message={LL.BD_USER_PASSWORD_ERROR()} status={"error"} variant={"inline"} />

        if (errorType === PinVerificationError.EDIT_PIN && errorValue)
            return <AlertInline message={LL.BD_USER_EDIT_PASSWORD_ERROR()} status={"error"} variant={"inline"} />

        return MESSAGE_FAKE_PLACEHOLDER
    }, [isPINRetype, LL, errorType, errorValue])

    const getPinMessage = useMemo(() => {
        return <Text style={themedStyles.messageTextStyle}>{getMessageText}</Text>
    }, [getMessageText, themedStyles.messageTextStyle])

    return (
        <View style={themedStyles.container}>
            <View style={themedStyles.pinsContainer}>
                {Array.from(Array(digitNumber).keys()).map((digit, idx) => {
                    const digitExist = pin[idx]
                    return (
                        <View
                            key={digit}
                            style={[
                                themedStyles.pinBase,
                                ...(digitExist ? [themedStyles.pressed] : [themedStyles.notPressed]),
                            ]}
                        />
                    )
                })}
            </View>

            {getPinMessage}
        </View>
    )
})

const baseStyles = (isMessageVisible: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            height: 48,
            alignItems: "center",
            justifyContent: "space-between",
        },
        pinsContainer: {
            height: 8,
            flexDirection: "row",
            justifyContent: "center",
        },
        pinBase: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 8,
        },
        pressed: {
            backgroundColor: theme.colors.pinFilled,
        },
        notPressed: {
            backgroundColor: theme.colors.pinEmpty,
        },
        messageTextStyle: {
            opacity: isMessageVisible ? 1 : 0,
        },
    })
