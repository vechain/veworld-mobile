import { HexUInt } from "@vechain/sdk-core"
import { useMemo } from "react"
import { useVthoExchangeRate } from "~Api/Coingecko"
import { VTHO } from "~Constants"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

export const useGasFee = (paid?: string) => {
    const currency = useAppSelector(selectCurrency)
    const { data: VTHOexchangeRate } = useVthoExchangeRate(currency)

    const vthoGasFee = useMemo(() => {
        if (!paid) return
        return BigNutils(HexUInt.of(paid).bi.toString()).toHuman(VTHO.decimals).decimals(2).toString
    }, [paid])

    const fiatValueGasFeeSpent = useMemo(() => {
        if (VTHOexchangeRate && vthoGasFee) {
            const { value, isLeesThan_0_01 } = BigNutils().toCurrencyConversion(vthoGasFee, VTHOexchangeRate)
            return isLeesThan_0_01 ? `< ${value}` : value
        }
    }, [VTHOexchangeRate, vthoGasFee])

    return { vthoGasFee, fiatValueGasFeeSpent }
}
