import { useMemo } from "react"
import { BalanceUtils } from "~Utils"
import { TokenWithCompleteInfo } from "~Model"

export const useBalances = ({ token }: { token: TokenWithCompleteInfo }) => {
    const fiatBalance = useMemo(
        () =>
            BalanceUtils.getFiatBalance(
                token?.balance?.balance ?? "0",
                token?.rate || 0,
                token.decimals,
            ),
        [token?.balance?.balance, token.decimals, token?.rate],
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
