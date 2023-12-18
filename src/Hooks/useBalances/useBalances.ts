import { useMemo } from "react"
import { BalanceUtils } from "~Utils"
import { Balance, FungibleToken } from "~Model"

export const useBalances = ({
    token,
    exchangeRate,
}: {
    token: FungibleToken & { balance?: Balance }
    exchangeRate?: number | null
}) => {
    const fiatBalance = useMemo(
        () =>
            BalanceUtils.getFiatBalance(
                token.balance?.balance ?? "0",
                exchangeRate ?? 0,
                token.decimals,
            ),
        [token?.balance?.balance, token.decimals, exchangeRate],
    )

    const tokenUnitBalance = useMemo(
        () =>
            BalanceUtils.getTokenUnitBalance(
                token?.balance?.balance ?? "0",
                token.decimals,
            ),
        [token?.balance?.balance, token.decimals],
    )

    return { fiatBalance, tokenUnitBalance }
}
