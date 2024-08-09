import React, { useMemo } from "react"
import { BaseTextProps } from "~Components"
import { VET, VTHO } from "~Constants"
import { useTheme, useTokenWithCompleteInfo } from "~Hooks"
import FiatBalance from "./FiatBalance"

type AccountFiatBalanceProps = {
    isVisible?: boolean
    isLoading?: boolean
    typographyFont?: BaseTextProps["typographyFont"]
    color?: BaseTextProps["color"]
}

const AccountFiatBalance: React.FC<AccountFiatBalanceProps> = (props: AccountFiatBalanceProps) => {
    const { isLoading = false, isVisible = true } = props
    const theme = useTheme()

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)

    const sum = useMemo(
        () => Number(tokenWithInfoVET.fiatBalance) + Number(tokenWithInfoVTHO.fiatBalance),
        [tokenWithInfoVET.fiatBalance, tokenWithInfoVTHO.fiatBalance],
    )

    const isLong = useMemo(() => sum.toFixed(2).length > 12, [sum])

    return (
        <FiatBalance
            isLoading={isLoading}
            isVisible={isVisible}
            color={theme.colors.textReversed}
            typographyFont={isLong ? "title" : "largeTitle"}
            balances={[tokenWithInfoVET.fiatBalance, tokenWithInfoVTHO.fiatBalance]}
        />
    )
}

export default AccountFiatBalance
