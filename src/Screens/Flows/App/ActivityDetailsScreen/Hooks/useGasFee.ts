import { BigNumber } from "bignumber.js"
import { useEffect, useMemo, useState } from "react"
import { useVthoExchangeRate } from "~Api/Coingecko"
import { showInfoToast, useThor } from "~Components"
import { ERROR_EVENTS } from "~Constants"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils, GasUtils, warn } from "~Utils"
import { useI18nContext } from "~i18n"

export const useGasFee = (gasUsed?: number) => {
    const thor = useThor()

    const [vthoGasFee, setVthoGasFee] = useState<string>()

    const { LL } = useI18nContext()

    useEffect(() => {
        if (!gasUsed) return
        const calculateVthoFee = async () => {
            try {
                const baseGasPrice = await GasUtils.getBaseGasPrice(thor)
                const { gasFee } = GasUtils.gasToVtho({
                    gas: new BigNumber(gasUsed || 0),
                    baseGasPrice: new BigNumber(baseGasPrice),
                })
                setVthoGasFee(gasFee)
            } catch (e) {
                warn(ERROR_EVENTS.SEND, e)
                showInfoToast({
                    text1: LL.HEADS_UP(),
                    text2: LL.NOTIFICATION_GAS_FEE_INACCURATE(),
                })
            }
        }
        calculateVthoFee()
    }, [LL, gasUsed, thor])

    const currency = useAppSelector(selectCurrency)
    const { data: VTHOexchangeRate } = useVthoExchangeRate(currency)

    const fiatValueGasFeeSpent = useMemo(() => {
        if (VTHOexchangeRate && vthoGasFee) {
            const { value, isLeesThan_0_01 } = BigNutils().toCurrencyConversion(vthoGasFee, VTHOexchangeRate)
            return isLeesThan_0_01 ? `< ${value}` : value
        }
    }, [VTHOexchangeRate, vthoGasFee])

    return { vthoGasFee, fiatValueGasFeeSpent }
}
