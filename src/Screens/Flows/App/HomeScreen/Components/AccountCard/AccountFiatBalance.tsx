import React, { useMemo } from "react"
import { B3TR, VET, VOT3, VTHO } from "~Constants"
import { useNonVechainTokenFiat, useTheme, useTokenWithCompleteInfo } from "~Hooks"
import { FiatBalance } from "~Components"
import { BigNutils } from "~Utils"

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
    const veB3trBalance = BigNutils(tokenWithInfoVOT3.tokenUnitFullBalance).plus(tokenWithInfoB3TR.tokenUnitFullBalance)
    const veB3trFiat = BigNutils(veB3trBalance.toString).multiply(tokenWithInfoB3TR.exchangeRate ?? 0)

    const nonVechaiTokensFiat = useNonVechainTokenFiat()

    const sum = useMemo(
        () =>
            Number(tokenWithInfoVET.fiatBalance) +
            Number(tokenWithInfoVTHO.fiatBalance) +
            Number(veB3trFiat.toCurrencyFormat_string(2)) +
            Number(nonVechaiTokensFiat.reduce((a, b) => Number(a) + Number(b), 0)),
        [tokenWithInfoVET.fiatBalance, tokenWithInfoVTHO.fiatBalance, veB3trFiat, nonVechaiTokensFiat],
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
                veB3trFiat.toString,
                ...nonVechaiTokensFiat,
            ]}
        />
    )
}

export default AccountFiatBalance
