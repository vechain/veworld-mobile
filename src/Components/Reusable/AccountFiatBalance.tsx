import { default as React, useMemo } from "react"
import { FiatBalance } from "~Components"
import { useTheme } from "~Hooks"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"

type AccountFiatBalanceProps = {
    isVisible?: boolean
}

const parseFiatBalance = (value: string) => {
    //Fiat balances that have a value < 0.01, have the value set as '< < 0.01'
    if (value.includes("<")) return 0
    return Number(value)
}

const AccountFiatBalance: React.FC<AccountFiatBalanceProps> = ({ isVisible = true }: AccountFiatBalanceProps) => {
    const accountAddress = useAppSelector(selectSelectedAccountAddress)

    const theme = useTheme()

    const { balances, isLoading } = useTotalFiatBalance({ address: accountAddress! })

    const sum = useMemo(() => balances.reduce((acc, curr) => acc + parseFiatBalance(curr), 0), [balances])

    const isLong = useMemo(() => sum.toFixed(2).length > 12, [sum])

    return (
        <FiatBalance
            isLoading={isLoading}
            isVisible={isVisible}
            color={theme.colors.textReversed}
            typographyFont={isLong ? "title" : "largeTitle"}
            balances={balances}
        />
    )
}

export default AccountFiatBalance
