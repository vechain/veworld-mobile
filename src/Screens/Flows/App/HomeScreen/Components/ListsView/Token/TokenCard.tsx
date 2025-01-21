import React, { memo, useMemo } from "react"
import { useBalances, useTheme } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import { useVechainStatsTokenInfo } from "~Api/Coingecko"
import { BalanceUtils } from "~Utils"
import { BaseTokenCard } from "./BaseTokenCard"
import { TokenCardBalanceInfo } from "~Screens/Flows/App/HomeScreen/Components/ListsView/Token/TokenCardBalanceInfo"
import { FiatBalance } from "~Components"

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
        return !!exchangeRate
    }, [exchangeRate])

    return (
        <BaseTokenCard
            icon={tokenWithBalance.icon}
            symbol={tokenWithBalance.symbol}
            isLoading={isTokensOwnedLoading}
            isBalanceVisible={isBalanceVisible}
            tokenBalance={tokenBalance}
            rightContent={
                showFiatBalance ? (
                    <TokenCardBalanceInfo
                        isLoading={isTokensOwnedLoading}
                        renderFiatBalance={
                            <FiatBalance
                                typographyFont="captionRegular"
                                color={theme.colors.tokenCardText}
                                balances={[fiatBalance]}
                                isVisible={isBalanceVisible}
                            />
                        }
                    />
                ) : null
            }
        />
    )
})
