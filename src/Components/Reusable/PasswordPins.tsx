import React, { FC, memo, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    UserPinArray: (string | undefined)[]
    isPINRetype?: boolean
    isPinError: boolean
}

const MESSAGE_FAKE_PLACEHOLDER = "placeholder"
export const PasswordPins: FC<Props> = memo(
    ({ UserPinArray, isPINRetype, isPinError }) => {
        const { LL } = useI18nContext()

        const isMessageVisible = useMemo(
            () => !!(isPinError || isPINRetype),
            [isPinError, isPINRetype],
        )
        const { styles: themedStyles, theme } = useThemedStyles(
            baseStyles(isMessageVisible),
        )

        const getMessageText = useMemo(() => {
            if (isPINRetype) return LL.BD_USER_PASSWORD_CONFIRM()
            if (isPinError) return LL.BD_USER_PASSWORD_ERROR()
            return MESSAGE_FAKE_PLACEHOLDER
        }, [LL, isPINRetype, isPinError])

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
            <BaseView>
                <BaseView flexDirection="row" justifyContent="center">
                    {UserPinArray.map((digit, index) => {
                        return (
                            <BaseView
                                key={`digit${index}`}
                                mx={10}
                                style={[
                                    themedStyles.pinBase,
                                    ...(digit
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
            width: 12,
            height: 12,
            borderRadius: 6,
        },
        pressed: {
            backgroundColor: theme.colors.text,
        },
        notPressed: {
            backgroundColor: theme.colors.darkPurpleDisabled,
        },
        messageTextStyle: { opacity: isMessageVisible ? 1 : 0 },
    })
