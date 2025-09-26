import { useMemo } from "react"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { Balance, FungibleToken } from "~Model"
import { BalanceUtils, BigNutils } from "~Utils"
import { formatDisplayNumber } from "~Utils/StandardizedFormatting"

type Props = {
    token: FungibleToken & { balance?: Balance }
    exchangeRate?: number
}
export const useBalances = ({ token, exchangeRate }: Props) => {
    const { formatLocale } = useFormatFiat()

    const fiatBalance = useMemo(
        () => BalanceUtils.getFiatBalance(token?.balance?.balance ?? "0", exchangeRate ?? 0, token.decimals),
        [token?.balance?.balance, token.decimals, exchangeRate],
    )

    const tokenUnitBalance = useMemo(() => {
        const humanBalance = BigNutils(token?.balance?.balance ?? "0").toHuman(token.decimals).toString
        return formatDisplayNumber(humanBalance, { locale: formatLocale })
    }, [token?.balance?.balance, token.decimals, formatLocale])

    const tokenUnitFullBalance = useMemo(() => {
        return BalanceUtils.getTokenUnitBalance(token?.balance?.balance ?? "0", token.decimals, 10, formatLocale)
    }, [token?.balance?.balance, token.decimals, formatLocale])

    return { fiatBalance, tokenUnitBalance, tokenUnitFullBalance }
}
