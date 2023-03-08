import React from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, FormattingUtils, useThemedStyles } from "~Common"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { Account } from "~Storage"

type Props = {
    account: Account
}
export const AccountWithBalanceBox: React.FC<Props> = ({ account }) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    return (
        <BaseView style={themedStyles.container}>
            <BaseText>{account.alias}</BaseText>
            <BaseView style={themedStyles.rightSubContainer}>
                <BaseText>
                    {FormattingUtils.humanAddress(account.address, 4, 6)}
                </BaseText>
                <BaseSpacer height={4} />
                <BaseText>1.2235 VET</BaseText>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.card,
            width: "100%",
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
