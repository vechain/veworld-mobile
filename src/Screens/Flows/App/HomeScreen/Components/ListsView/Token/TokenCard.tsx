import React, { memo, useMemo } from "react"
import { useVechainStatsTokenInfo } from "~Api/Coingecko"
import { FiatBalance } from "~Components"
import { B3TR, COLORS, VeDelegate } from "~Constants"
import { useBalances, useFormatFiat, useTheme } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import { formatTokenAmount } from "~Utils/StandardizedFormatting"
import { BaseTokenCard } from "./BaseTokenCard"
import { TokenCardBalanceInfo } from "./TokenCardBalanceInfo"

type Props = {
    tokenWithBalance: FungibleTokenWithBalance
    isEdit: boolean
    isBalanceVisible: boolean
}

export const TokenCard = memo(({ tokenWithBalance, isEdit, isBalanceVisible }: Props) => {
    const theme = useTheme()
    const tokenValueLabelColor = theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500

    const { formatLocale } = useFormatFiat()

    const { data: exchangeRate } = useVechainStatsTokenInfo(
        tokenWithBalance.symbol === VeDelegate.symbol
            ? B3TR.symbol.toLowerCase()
            : tokenWithBalance.symbol.toLowerCase(),
    )

    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const { fiatBalance } = useBalances({
        token: { ...tokenWithBalance },
        exchangeRate: parseFloat(exchangeRate ?? "0"),
    })

    const tokenBalance = useMemo(() => {
        return formatTokenAmount(
            tokenWithBalance.balance.balance,
            tokenWithBalance.symbol,
            tokenWithBalance.decimals ?? 0,
            { locale: formatLocale, includeSymbol: false },
        )
    }, [formatLocale, tokenWithBalance.balance.balance, tokenWithBalance.decimals, tokenWithBalance.symbol])

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
                                typographyFont="bodySemiBold"
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
