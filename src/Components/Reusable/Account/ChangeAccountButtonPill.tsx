import React from "react"
import { StyleSheet, View } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { selectVnsNameOrAddress, useAppSelector } from "~Storage/Redux"

type Props = {
    title: string
    text: string
    action: () => void
}

export const ChangeAccountButtonPill = ({ title, text, action }: Props) => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)
    const nameOrAddress = useAppSelector(state => selectVnsNameOrAddress(state, text, [4, 3]))

    return (
        <BaseTouchable action={action} style={themedStyles.container} haptics="Light">
            <BaseView w={85} px={15}>
                <BaseText
                    color={theme.colors.textReversed}
                    typographyFont="smallCaptionBold"
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {title}
                </BaseText>
                <BaseText
                    color={theme.colors.textReversed}
                    typographyFont="smallCaptionRegular"
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {nameOrAddress}
                </BaseText>
            </BaseView>

            <View style={themedStyles.seperator} />

            <BaseView w={35}>
                <BaseIcon name="icon-arrow-left-right" color={theme.colors.textReversed} />
            </BaseView>
        </BaseTouchable>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            height: 40,
            width: 120,
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
