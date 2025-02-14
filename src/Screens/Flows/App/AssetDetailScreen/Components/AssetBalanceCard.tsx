import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { TokenWithCompleteInfo, useThemedStyles } from "~Hooks"
import { BalanceView } from "~Screens/Flows/App/AssetDetailScreen/Components/BalanceView"
import { StyleSheet } from "react-native"
import { ColorThemeType } from "~Constants"
import { useI18nContext } from "~i18n"

type Props = {
    tokenWithInfo: TokenWithCompleteInfo
    isBalanceVisible: boolean
    FastActions: React.ReactNode
}

export const AssetBalanceCard = ({ tokenWithInfo, isBalanceVisible, FastActions }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()

    return (
        <BaseView w={100}>
            <BaseText color={theme.colors.text} typographyFont="bodySemiBold">
                {LL.BD_YOUR_BALANCE()}
            </BaseText>

            <BaseSpacer height={12} />

            <BaseView w={100} style={styles.cardContainer}>
                <BalanceView tokenWithInfo={tokenWithInfo} isBalanceVisible={isBalanceVisible} />
                {FastActions}
            </BaseView>
        </BaseView>
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        cardContainer: {
            flexDirection: "column",
            gap: 16,
            borderRadius: 12,
            borderWidth: 1,
            padding: 16,
            backgroundColor: theme.colors.assetDetailsCard.background,
            borderColor: theme.colors.assetDetailsCard.border,
        },
    })
