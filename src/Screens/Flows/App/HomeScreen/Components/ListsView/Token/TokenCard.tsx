import React, { memo, useMemo } from "react"
import { BaseView, FiatBalance } from "~Components"
import { useBalances, useTheme } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import { useVechainStatsTokenInfo } from "~Api/Coingecko"
import { BalanceUtils } from "~Utils"
import { BaseTokenCard } from "./BaseTokenCard"
import { StyleSheet } from "react-native"

type Props = {
    tokenWithBalance: FungibleTokenWithBalance
    isBalanceVisible: boolean
}

export const TokenCard = memo(({ tokenWithBalance, isBalanceVisible }: Props) => {
    const theme = useTheme()
    const { data: exchangeRate } = useVechainStatsTokenInfo(tokenWithBalance.symbol.toLowerCase())
    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const { fiatBalance } = useBalances({
        token: { ...tokenWithBalance },
        exchangeRate: parseFloat(exchangeRate ?? "0"),
    })

    const tokenBalance = useMemo(
        () => BalanceUtils.getTokenUnitBalance(tokenWithBalance.balance.balance, tokenWithBalance.decimals ?? 0, 2),
        [tokenWithBalance.balance.balance, tokenWithBalance.decimals],
    )

    const showFiatBalance = useMemo(() => {
        const numericBalance = Number(fiatBalance)
        return numericBalance > 0
    }, [fiatBalance])

    const rightContent = showFiatBalance ? (
        <BaseView style={styles.container}>
            <FiatBalance
                color={theme.colors.tokenCardText}
                balances={[fiatBalance]}
                typographyFont="captionRegular"
                isVisible={isBalanceVisible}
                isLoading={isTokensOwnedLoading}
            />
        </BaseView>
    ) : null

    return (
        <BaseTokenCard
            icon={tokenWithBalance.icon}
            symbol={tokenWithBalance.symbol}
            isLoading={isTokensOwnedLoading}
            isBalanceVisible={isBalanceVisible}
            tokenBalance={tokenBalance}
            rightContent={rightContent}
        />
    )
})

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-end",
    },
})
