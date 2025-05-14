import React, { useMemo } from "react"
import { BaseTokenCard } from "./BaseTokenCard"
import { TokenCardBalanceInfo } from "./TokenCardBalanceInfo"
import { FiatBalance } from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import { useTheme, useTokenCardFiatInfo, useTokenWithCompleteInfo } from "~Hooks"
import { COLORS } from "~Constants"
import { BalanceUtils } from "~Utils"

type Props = {
    tokenWithBalance: FungibleTokenWithBalance
    isBalanceVisible: boolean
    isEdit: boolean
}

export const BridgeTokenCard = ({ tokenWithBalance, isBalanceVisible, isEdit }: Props) => {
    const theme = useTheme()

    const tokenValueLabelColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_800

    const tokenWithCompleteInfo = useTokenWithCompleteInfo(tokenWithBalance)

    const { fiatBalance, change24h, isPositive24hChange, exchangeRate, isTokensOwnedLoading } =
        useTokenCardFiatInfo(tokenWithCompleteInfo)

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
}
