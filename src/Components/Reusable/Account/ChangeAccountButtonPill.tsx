import React from "react"
import { StyleSheet, View } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"

type Props = {
    title: string
    text: string
    action: () => void
}

export const ChangeAccountButtonPill = ({ title, text, action }: Props) => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseTouchable
            action={action}
            style={themedStyles.container}
            haptics="Light">
            <BaseView>
                <BaseText
                    color={theme.colors.textReversed}
                    typographyFont="smallCaptionBold">
                    {title}
                </BaseText>
                <BaseText
                    color={theme.colors.textReversed}
                    typographyFont="smallCaption">
                    {text}
                </BaseText>
            </BaseView>

            <View style={themedStyles.seperator} />

            <BaseIcon
                name="account-sync-outline"
                color={theme.colors.textReversed}
            />
        </BaseTouchable>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            height: 40,
            width: 123,
            borderRadius: 12,
            overflow: "hidden",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            backgroundColor: theme.colors.primary,
        },
        seperator: {
            height: "100%",
            width: 1,
            backgroundColor: theme.colors.textReversed,
        },
    })
