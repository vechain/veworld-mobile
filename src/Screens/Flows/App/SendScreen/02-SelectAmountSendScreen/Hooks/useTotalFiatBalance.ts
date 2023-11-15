import { useMemo } from "react"
import { CurrencyExchangeRate } from "~Model"
import { FormattingUtils } from "~Utils"

export const useTotalFiatBalance = (
    tokenTotalBalance: string,
    exchangeRate: CurrencyExchangeRate | undefined,
) => {
    /**
     * TOKEN total balance in FIAT in raw-ish format (with decimals)
     * Example "53.497751509681790983423610572503055269"
     */
    const fiatTotalBalance = useMemo(
        () =>
            FormattingUtils.convertToFiatBalance(
                tokenTotalBalance || "0",
                exchangeRate?.rate ?? 1,
                0,
            ),
        [exchangeRate?.rate, tokenTotalBalance],
    )

    return { fiatTotalBalance }
}
