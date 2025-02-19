import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { TokenWithCompleteInfo, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import { B3TR, ColorThemeType } from "~Constants"
import { useI18nContext } from "~i18n"
import { VbdBalanceCard } from "~Screens/Flows/App/AssetDetailScreen/Components/VbdBalanceCard"
import { VetBalanceCard } from "~Screens/Flows/App/AssetDetailScreen/Components/VetBalanceCard"

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
                {tokenWithInfo.symbol === B3TR.symbol ? (
                    <VbdBalanceCard isBalanceVisible={isBalanceVisible} />
                ) : (
                    <VetBalanceCard
                        tokenWithInfo={tokenWithInfo}
                        isBalanceVisible={isBalanceVisible}
                        FastActions={FastActions}
                    />
                )}
            </BaseView>
        </BaseView>
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        cardContainer: {
            flexDirection: "column",
            borderRadius: 12,
            paddingVertical: 16,
            backgroundColor: theme.colors.assetDetailsCard.background,
        },
        nonVbdContainer: {
            paddingHorizontal: 16,
        },
    })
