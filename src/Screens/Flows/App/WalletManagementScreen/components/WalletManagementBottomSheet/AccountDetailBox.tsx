import React from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, FormattingUtils, useThemedStyles } from "~Common"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { Account } from "~Storage"

type Props = {
    account: Account
}
export const AccountDetailBox: React.FC<Props> = ({ account }) => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)
    return (
        <BaseView
            w={100}
            orientation="row"
            align="center"
            justify="space-between">
            <BaseTouchableBox action={() => {}} style={themedStyles.container}>
                <BaseText style={themedStyles.alias}>{account.alias}</BaseText>
                <BaseView style={themedStyles.rightSubContainer}>
                    <BaseText style={themedStyles.address} fontSize={10}>
                        {FormattingUtils.humanAddress(account.address, 4, 6)}
                    </BaseText>
                    <BaseSpacer height={4} />
                    <BaseText fontSize={10}>1.2235 VET</BaseText>
                </BaseView>
            </BaseTouchableBox>
            <BaseIcon
                size={24}
                style={{ marginLeft: 16 }}
                name="eye-outline"
                bg={theme.colors.secondary}
            />
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        alias: {
            opacity: 0.7,
        },
        address: {
            opacity: 0.7,
        },
        container: {
            backgroundColor: theme.colors.card,
            width: "70%",
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        rightSubContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
    })
