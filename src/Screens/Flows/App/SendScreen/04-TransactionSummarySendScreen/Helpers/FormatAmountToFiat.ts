import { FormattingUtils } from "~Utils"
import { BigNumber } from "bignumber.js"
import { CurrencyExchangeRate } from "~Model"

type Props = {
    amount: string
    txCostTotal: BigNumber
    decimals: number
    exchangeRate: CurrencyExchangeRate | undefined
    isVtho: boolean
}

export const FormatAmountToFiat = ({ amount, txCostTotal, decimals, exchangeRate, isVtho }: Props) => {
    const fee = isVtho ? txCostTotal : amount

    return FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(
            FormattingUtils.scaleNumberDown(fee, decimals, decimals, BigNumber.ROUND_DOWN) || "0",
            exchangeRate?.rate || 1,
            0,
        ),
        FormattingUtils.scaleNumberDown(fee ? amount : txCostTotal, decimals, decimals, BigNumber.ROUND_DOWN),
    )
}
