import React, { useMemo } from "react"
import { FiatBalance } from "~Components"
import { COLORS } from "~Constants"
import { useFormatFiat, useTheme, useTokenCardFiatInfo, useTokenWithCompleteInfo } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { BigNutils } from "~Utils"
import { formatDisplayNumber } from "~Utils/StandardizedFormatting"
import { BaseTokenCard } from "./BaseTokenCard"
import { TokenCardBalanceInfo } from "./TokenCardBalanceInfo"

type Props = {
    tokenWithBalance: FungibleTokenWithBalance
    isBalanceVisible: boolean
    isEdit: boolean
}

export const BridgeTokenCard = ({ tokenWithBalance, isBalanceVisible, isEdit }: Props) => {
    const theme = useTheme()
    const { formatLocale } = useFormatFiat()

    const tokenValueLabelColor = theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500

    const tokenWithCompleteInfo = useTokenWithCompleteInfo(tokenWithBalance)

    const { fiatBalance, change24h, isPositive24hChange, exchangeRate, isTokensOwnedLoading } =
        useTokenCardFiatInfo(tokenWithCompleteInfo)

    const tokenBalance = useMemo(() => {
        const humanBalance = BigNutils(tokenWithBalance.balance.balance).toHuman(
            tokenWithBalance.decimals ?? 0,
        ).toString
        return formatDisplayNumber(humanBalance, { locale: formatLocale })
    }, [formatLocale, tokenWithBalance.balance.balance, tokenWithBalance.decimals])

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
            isCrossChainToken
            rightContent={
                showFiatBalance ? (
                    <TokenCardBalanceInfo
                        isAnimation={isEdit}
                        isLoading={isTokensOwnedLoading}
                        change24h={change24h}
                        isPositive24hChange={isPositive24hChange}
                        renderFiatBalance={
                            <FiatBalance
                                typographyFont="subSubTitleMedium"
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
}
