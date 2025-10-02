import { useMemo } from "react"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { Balance, FungibleToken } from "~Model"
import { BalanceUtils } from "~Utils"

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

    const tokenUnitBalance = useMemo(
        () => BalanceUtils.getTokenUnitBalance(token?.balance?.balance ?? "0", token.decimals, 2, formatLocale),
        [token?.balance?.balance, token.decimals, formatLocale],
    )

    const tokenUnitFullBalance = useMemo(
        () => BalanceUtils.getTokenUnitBalance(token?.balance?.balance ?? "0", token.decimals, 10, formatLocale),
        [token?.balance?.balance, token.decimals, formatLocale],
    )

    return { fiatBalance, tokenUnitBalance, tokenUnitFullBalance }
}
