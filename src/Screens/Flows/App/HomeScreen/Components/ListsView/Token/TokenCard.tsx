import React, { memo, useMemo } from "react"
import { FiatBalance } from "~Components"
import { COLORS } from "~Constants"
import { useBalances, useTheme } from "~Hooks"
import { BalanceUtils } from "~Utils"
import { FungibleTokenWithBalance } from "~Model"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import { useVechainStatsTokenInfo } from "~Api/Coingecko"
import { BaseTokenCard } from "./BaseTokenCard"
import { TokenCardBalanceInfo } from "./TokenCardBalanceInfo"

type Props = {
    tokenWithBalance: FungibleTokenWithBalance
    isEdit: boolean
    isBalanceVisible: boolean
}

export const TokenCard = memo(({ tokenWithBalance, isEdit, isBalanceVisible }: Props) => {
    const theme = useTheme()
    const tokenValueLabelColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_800

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
                        isAnimation={isEdit}
                        isLoading={isTokensOwnedLoading}
                        renderFiatBalance={
                            <FiatBalance
                                typographyFont="subSubTitleSemiBold"
                                color={tokenValueLabelColor}
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
