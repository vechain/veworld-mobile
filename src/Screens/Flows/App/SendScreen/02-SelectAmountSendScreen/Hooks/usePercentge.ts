import { useMemo } from "react"
import { throttle } from "lodash"
import { BigNumber } from "bignumber.js"
import { FormattingUtils } from "~Utils"
import { CurrencyExchangeRate } from "~Model"

type Props = {
    tokenTotalBalance: string
    isInputInFiat: boolean
    input: string
    fiatTotalBalance: string
    validateSufficientBalance: (newValue: string) => void
    exchangeRate: CurrencyExchangeRate | undefined
}

export const usePercentge = ({
    tokenTotalBalance,
    isInputInFiat,
    input,
    fiatTotalBalance,
    validateSufficientBalance,
    exchangeRate,
}: Props) => {
    /**
     * Calculate the percentage of the selected amount shown in the range slider
     */
    const percentage = useMemo(() => {
        if (new BigNumber(tokenTotalBalance).isZero()) return 0

        if (isInputInFiat) return new BigNumber(input).div(fiatTotalBalance).multipliedBy(100).toNumber() || 0
        return new BigNumber(input).div(tokenTotalBalance).multipliedBy(100).toNumber() || 0
    }, [input, tokenTotalBalance, fiatTotalBalance, isInputInFiat])

    /**
     * Calculate the new percentage when the range slider is moved
     * @param value position value from the range slider
     */
    const onChangePercentage = (value: number) => {
        const newTokenInput = new BigNumber(tokenTotalBalance).div(100).multipliedBy(value).toString()

        validateSufficientBalance(
            isInputInFiat
                ? Number(
                      FormattingUtils.convertToFiatBalance(newTokenInput || "0", exchangeRate?.rate ?? 1, 0),
                  ).toFixed(2)
                : new BigNumber(newTokenInput).decimalPlaces(2, BigNumber.ROUND_DOWN).toString(),
        )
    }

    const throttleOnChangePercentage = throttle(onChangePercentage, 100)

    return { percentage, throttleOnChangePercentage }
}
