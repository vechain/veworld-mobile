import React, { FC, useCallback } from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    UserPinArray: (string | undefined)[]
    isPINRetype?: boolean
    isPinError: boolean
}

export const PasswordPins: FC<Props> = ({
    UserPinArray,
    isPINRetype,
    isPinError,
}) => {
    const { LL } = useI18nContext()

    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)

    const getPinMessage = useCallback(() => {
        const message = isPINRetype
            ? LL.BD_USER_PASSWORD_CONFIRM()
            : isPinError
            ? LL.BD_USER_PASSWORD_ERROR()
            : "a"
        const color = isPINRetype
            ? theme.colors.primary
            : isPinError
            ? theme.colors.danger
            : undefined

        const isVisible = isPinError || isPINRetype
        return (
            <BaseText
                style={{ opacity: isVisible ? 1 : 0 }}
                typographyFont="bodyAccent"
                alignContainer="center"
                color={color}
                my={16}>
                {message}
            </BaseText>
        )
    }, [isPINRetype, isPinError, theme, LL])

    return (
        <BaseView>
            <BaseView orientation="row" justify="center">
                {UserPinArray.map((digit, index) => {
                    return (
                        <BaseView
                            key={`digit${index}`}
                            mx={10}
                            background={theme.colors.text}
                            style={[
                                themedStyles.pinBase,
                                ...(digit
                                    ? [themedStyles.digited]
                                    : [themedStyles.notDigited]),
                            ]}
                        />
                    )
                })}
            </BaseView>

            {getPinMessage()}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        pinBase: {
            width: 12,
            height: 12,
            borderRadius: 6,
        },
        digited: {
            backgroundColor: theme.colors.text,
        },
        notDigited: {
            backgroundColor: theme.colors.darkPurpleDisabled,
        },
    })
