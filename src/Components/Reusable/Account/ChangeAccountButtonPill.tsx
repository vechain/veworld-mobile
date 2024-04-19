import React from "react"
import { StyleSheet, View } from "react-native"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useThemedStyles, useVns } from "~Hooks"
import { ColorThemeType } from "~Constants"

import { AddressUtils } from "~Utils"

type Props = {
    title: string
    text: string
    action: () => void
}

export const ChangeAccountButtonPill = ({ title, text, action }: Props) => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)
    const { name: vnsName, address: vnsAddress } = useVns({ name: "", address: text })

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
                    {vnsName || AddressUtils.humanAddress(vnsAddress ?? text, 6, 3)}
                </BaseText>
            </BaseView>

            <View style={themedStyles.seperator} />

            <BaseView w={35}>
                <BaseIcon name="account-sync-outline" color={theme.colors.textReversed} />
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
