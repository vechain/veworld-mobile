import { useMemo } from "react"
import { BalanceUtils } from "~Utils"
import { Balance, FungibleToken } from "~Model"

type Props = {
    token: FungibleToken & { balance?: Balance }
    exchangeRate?: number
}
export const useBalances = ({ token, exchangeRate }: Props) => {
    const fiatBalance = useMemo(
        () => BalanceUtils.getFiatBalance(token?.balance?.balance ?? "0", exchangeRate ?? 0, token.decimals),
        [token?.balance?.balance, token.decimals, exchangeRate],
    )

    const tokenUnitBalance = useMemo(
        () => BalanceUtils.getTokenUnitBalance(token?.balance?.balance ?? "0", token.decimals, 2),
        [token?.balance?.balance, token.decimals],
    )

    const tokenUnitFullBalance = useMemo(
        () => BalanceUtils.getTokenUnitBalance(token?.balance?.balance ?? "0", token.decimals, 10),
        [token?.balance?.balance, token.decimals],
    )

    return { fiatBalance, tokenUnitBalance, tokenUnitFullBalance }
}
