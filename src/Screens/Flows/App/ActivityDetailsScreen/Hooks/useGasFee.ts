import { selectCurrencyExchangeRate } from "./../../../../../Storage/Redux/Selectors/Currency"
import { useEffect, useMemo, useState } from "react"
import { BigNumber } from "bignumber.js"
import { Activity } from "~Model"
import { useThor, showInfoToast } from "~Components"
import { VTHO } from "~Constants"
import { FormattingUtils, GasUtils, warn } from "~Utils"
import { RootState } from "~Storage/Redux/Types"
import { useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"

/**
 * `useGasFee` is a custom React Hook that calculates the gas fee for a specific activity (transaction).
 *
 * It fetches the transaction receipt from the provided activity object and calculates the gas fee in VTHO (VeChain's Thor token).
 * The gas fee is also converted to a human-readable format and its fiat value equivalent.
 *
 * @param {Activity} activity - The activity object, which contains details about a transaction.
 *
 * @returns {Object} - An object containing:
 * 1. `gasFeeInVTHO` - The gas fee in VTHO (VeChain's Thor token) in BigNumber format.
 * 2. `gasFeeInVTHOHumanReadable` - The gas fee in a human-readable format.
 * 3. `fiatValueGasFeeSpent` - The gas fee converted to its fiat value equivalent.
 *
 * @example
 * const { gasFeeInVTHO, gasFeeInVTHOHumanReadable, fiatValueGasFeeSpent } = useGasFee(activity)
 */
export const useGasFee = (activity: Activity) => {
    const thor = useThor()

    const [vthoGasFee, setVthoGasFee] = useState<string>()

    const { LL } = useI18nContext()

    /**
     * Effect hook to calculate the gas fee for a transaction.
     * The gas fee is calculated once the transaction receipt is available.
     */
    useEffect(() => {
        if (!activity.gasUsed) return
        const calculateVthoFee = async () => {
            try {
                const baseGasPrice = await GasUtils.getBaseGasPrice(thor)
                const gasFee = GasUtils.gasToVtho({
                    gas: new BigNumber(activity.gasUsed || 0),
                    baseGasPrice: new BigNumber(baseGasPrice),
                    decimals: 2,
                })
                setVthoGasFee(gasFee)
            } catch (e) {
                warn(e)
                showInfoToast({
                    text1: LL.HEADS_UP(),
                    text2: LL.NOTIFICATION_GAS_FEE_INACCURATE(),
                })
            }
        }
        calculateVthoFee()
    }, [LL, activity.gasUsed, thor])

    const VTHOexchangeRate = useAppSelector((state: RootState) =>
        selectCurrencyExchangeRate(state, VTHO),
    )

    const fiatValueGasFeeSpent = useMemo(() => {
        if (VTHOexchangeRate?.rate && vthoGasFee) {
            return FormattingUtils.humanNumber(
                FormattingUtils.convertToFiatBalance(
                    vthoGasFee,
                    VTHOexchangeRate.rate,
                    VTHO.decimals,
                ),
                vthoGasFee,
            )
        }
    }, [VTHOexchangeRate?.rate, vthoGasFee])

    return { vthoGasFee, fiatValueGasFeeSpent }
}
