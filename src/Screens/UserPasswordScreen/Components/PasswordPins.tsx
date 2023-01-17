import React, { FC } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Common"
import { BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    UserPinArray: (string | undefined)[]
    isPINRetype: boolean
    isPINErorr: boolean
}

export const PasswordPins: FC<Props> = ({
    UserPinArray,
    isPINRetype,
    isPINErorr,
}) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <BaseView h={10}>
            <BaseView orientation="row" justify="center">
                {UserPinArray.map((digit, index) => {
                    if (digit) {
                        return (
                            <BaseView
                                key={index}
                                mx={10}
                                background={theme.colors.reversed_bg}
                                style={[
                                    baseStyle.pinBase,
                                    { borderColor: theme.colors.reversed_bg },
                                ]}
                            />
                        )
                    } else {
                        return (
                            <BaseView
                                key={index}
                                mx={10}
                                style={[
                                    baseStyle.pinBase,
                                    { borderColor: theme.colors.reversed_bg },
                                ]}
                            />
                        )
                    }
                })}
            </BaseView>

            {isPINRetype && (
                <BaseText font="body_accent" alignContainer="center" my={10}>
                    {LL.BD_USER_PASSWORD_CONFIRM()}
                </BaseText>
            )}

            {isPINErorr && (
                <BaseText
                    font="body_accent"
                    color="red"
                    alignContainer="center"
                    my={10}>
                    {LL.BD_USER_PASSWORD_ERROR()}
                </BaseText>
            )}
        </BaseView>
    )
}

const baseStyle = StyleSheet.create({
    pinBase: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
})
