import React from "react"
import { BaseView } from "~Components"
import { TokenWithCompleteInfo, useThemedStyles } from "~Hooks"
import { BalanceView } from "~Screens/Flows/App/AssetDetailScreen/Components/BalanceView"
import { StyleSheet } from "react-native"
import { ColorThemeType } from "~Constants"

export const AssetBalanceCard = ({
    tokenWithInfo,
    isBalanceVisible,
}: {
    tokenWithInfo: TokenWithCompleteInfo
    isBalanceVisible: boolean
}) => {
    const { styles } = useThemedStyles(baseStyle)

    return (
        <BaseView w={100} style={styles.cardContainer}>
            <BalanceView tokenWithInfo={tokenWithInfo} isBalanceVisible={isBalanceVisible} />
        </BaseView>
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        cardContainer: {
            flexDirection: "column",
            borderRadius: 12,
            borderWidth: 1,
            padding: 16,
            backgroundColor: theme.colors.assetDetailsCard.background,
            borderColor: theme.colors.assetDetailsCard.border,
        },
    })
