import React, { memo, useMemo } from "react"
import { useVechainStatsTokenInfo } from "~Api/Coingecko"
import { FiatBalance } from "~Components"
import { COLORS, VeB3TR } from "~Constants"
import { useBalances, useTheme, useVeB3TRFiat } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"
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

    const isVeb3tr = tokenWithBalance.symbol.toLowerCase() === VeB3TR.symbol.toLowerCase()

    const veB3trBalance = useVeB3TRFiat()

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
        return isVeb3tr || !!exchangeRate
    }, [exchangeRate, isVeb3tr])

    const balances = useMemo(() => {
        if (isVeb3tr) {
            return [veB3trBalance]
        } else {
            return [fiatBalance]
        }
    }, [fiatBalance, isVeb3tr, veB3trBalance])

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
                                typographyFont="bodySemiBold"
                                color={tokenValueLabelColor}
                                balances={balances}
                                isVisible={isBalanceVisible}
                            />
                        }
                    />
                ) : null
            }
        />
    )
})
