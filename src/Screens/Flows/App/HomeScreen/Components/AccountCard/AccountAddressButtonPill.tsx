import React from "react"
import { StyleSheet, View } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { selectVnsNameOrAddress, useAppSelector } from "~Storage/Redux"

type Props = {
    text: string
    openQRCodeSheet: () => void
    switchAccount: () => void
}

export const AccountAddressButtonPill = ({ text, openQRCodeSheet, switchAccount }: Props) => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)
    const nameOrAddressFrom = useAppSelector(state => selectVnsNameOrAddress(state, text, [6, 3]))

    return (
        <BaseView flexDirection="row" style={themedStyles.container}>
            <BaseTouchable action={openQRCodeSheet} haptics="Light" style={themedStyles.pressable}>
                <BaseView flexDirection="row" px={8}>
                    <BaseText color={theme.colors.text} typographyFont="smallCaptionRegular">
                        {nameOrAddressFrom}
                    </BaseText>
                    <BaseSpacer width={4} />
                    <BaseIcon name="content-copy" color={theme.colors.text} size={12} />
                </BaseView>
            </BaseTouchable>
            <View style={themedStyles.seperator} />
            <BaseTouchable
                action={switchAccount}
                haptics="Light"
                style={themedStyles.pressable}
                testID="AccountCard_changeAccountButton">
                <BaseView px={8}>
                    <BaseIcon name="account-sync-outline" color={theme.colors.text} size={20} />
                </BaseView>
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            height: 32,
            borderRadius: 10,
            overflow: "hidden",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            backgroundColor: theme.colors.primaryReversed,
        },
        seperator: {
            height: "100%",
            width: 1,
            backgroundColor: theme.colors.primary,
        },
        pressable: {
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
        },
    })
