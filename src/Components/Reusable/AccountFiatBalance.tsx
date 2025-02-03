import React, { useMemo } from "react"
import { FiatBalance } from "~Components"
import { VET, VTHO } from "~Constants"
import { useNonVechainTokenFiat, useTheme, useTokenWithCompleteInfo } from "~Hooks"
import { selectBalanceForToken, selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"

type AccountFiatBalanceProps = {
    isVisible?: boolean
    isLoading?: boolean
}

const AccountFiatBalance: React.FC<AccountFiatBalanceProps> = (props: AccountFiatBalanceProps) => {
    const { isLoading = false, isVisible = true } = props
    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))

    const theme = useTheme()

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)

    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)
    const vot3RawBalance = useAppSelector(state => selectBalanceForToken(state, VOT3.address))

    const vot3FiatBalance = BalanceUtils.getFiatBalance(
        vot3RawBalance?.balance ?? "0",
        tokenWithInfoB3TR.exchangeRate ?? 0,
        VOT3.decimals,
    )

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
            color={theme.colors.textReversed}
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
