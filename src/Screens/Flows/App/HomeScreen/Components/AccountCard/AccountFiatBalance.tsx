import React, { useMemo } from "react"
import { B3TR, VET, VTHO } from "~Constants"
import { useNonVechainTokenFiat, useTheme, useTokenWithCompleteInfo } from "~Hooks"
import FiatBalance from "./FiatBalance"
import { BaseTextProps } from "~Components"

type AccountFiatBalanceProps = {
    isVisible?: boolean
    isLoading?: boolean
    typographyFont?: BaseTextProps["typographyFont"]
}

const AccountFiatBalance: React.FC<AccountFiatBalanceProps> = (props: AccountFiatBalanceProps) => {
    const { isLoading = false, isVisible = true, typographyFont } = props
    const theme = useTheme()

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)
    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)
    const nonVechaiTokensFiat = useNonVechainTokenFiat()

    const sum = useMemo(
        () =>
            Number(tokenWithInfoVET.fiatBalance) +
            Number(tokenWithInfoVTHO.fiatBalance) +
            Number(tokenWithInfoB3TR.fiatBalance) +
            Number(nonVechaiTokensFiat.reduce((a, b) => Number(a) + Number(b), 0)),
        [
            tokenWithInfoVET.fiatBalance,
            tokenWithInfoVTHO.fiatBalance,
            tokenWithInfoB3TR.fiatBalance,
            nonVechaiTokensFiat,
        ],
    )

    const isLong = useMemo(() => sum.toFixed(2).length > 12, [sum])

    const computedTypographyFont = useMemo(() => {
        if (typographyFont) return typographyFont
        if (isLong) return "title"

        return "largeTitle"
    }, [isLong, typographyFont])

    return (
        <FiatBalance
            isLoading={isLoading}
            isVisible={isVisible}
            color={theme.colors.textReversed}
            typographyFont={computedTypographyFont}
            balances={[
                tokenWithInfoVET.fiatBalance,
                tokenWithInfoVTHO.fiatBalance,
                tokenWithInfoB3TR.fiatBalance,
                ...nonVechaiTokensFiat,
            ]}
        />
    )
}

export default AccountFiatBalance
