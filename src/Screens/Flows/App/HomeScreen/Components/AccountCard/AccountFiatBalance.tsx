import React, { useMemo } from "react"
import { B3TR, VET, VOT3, VTHO } from "~Constants"
import { useNonVechainTokenFiat, useTheme, useTokenWithCompleteInfo } from "~Hooks"
import { FiatBalance } from "~Components"
import { BalanceUtils, BigNutils } from "~Utils"

type AccountFiatBalanceProps = {
    isVisible?: boolean
    isLoading?: boolean
}

const AccountFiatBalance: React.FC<AccountFiatBalanceProps> = (props: AccountFiatBalanceProps) => {
    const { isLoading = false, isVisible = true } = props
    const theme = useTheme()

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)

    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)
    const tokenWithInfoVOT3 = useTokenWithCompleteInfo(VOT3)
    const parseVot3Balance = BigNutils(tokenWithInfoVOT3.tokenUnitFullBalance).addTrailingZeros(
        tokenWithInfoVOT3.decimals,
    ).toString
    const vot3FiatBalance = BalanceUtils.getFiatBalance(parseVot3Balance, tokenWithInfoB3TR.exchangeRate ?? 0, 18)

    const nonVechaiTokensFiat = useNonVechainTokenFiat()

    const sum = useMemo(
        () =>
            Number(tokenWithInfoVET.fiatBalance) +
            Number(tokenWithInfoVTHO.fiatBalance) +
            Number(tokenWithInfoB3TR.fiatBalance) +
            Number(vot3FiatBalance) +
            Number(nonVechaiTokensFiat.reduce((a, b) => Number(a) + Number(b), 0)),
        [
            tokenWithInfoVET.fiatBalance,
            tokenWithInfoVTHO.fiatBalance,
            tokenWithInfoB3TR.fiatBalance,
            vot3FiatBalance,
            nonVechaiTokensFiat,
        ],
    )

    const isLong = useMemo(() => sum.toFixed(2).length > 12, [sum])

    return (
        <FiatBalance
            isLoading={isLoading}
            isVisible={isVisible}
            color={theme.colors.textSecondary}
            typographyFont={isLong ? "title" : "largeTitle"}
            balances={[
                tokenWithInfoVET.fiatBalance,
                tokenWithInfoVTHO.fiatBalance,
                tokenWithInfoB3TR.fiatBalance,
                vot3FiatBalance,
                ...nonVechaiTokensFiat,
            ]}
        />
    )
}

export default AccountFiatBalance
