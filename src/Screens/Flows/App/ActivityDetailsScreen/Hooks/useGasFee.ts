import { selectCurrencyExchangeRate } from "./../../../../../Storage/Redux/Selectors/Currency"
import { useEffect, useMemo, useState } from "react"
import { BigNumber } from "bignumber.js"
import { Activity } from "~Model"
import { useThor, showInfoToast } from "~Components"
import { VTHO } from "~Common"
import { FormattingUtils, GasUtils } from "~Utils"
import { DEFAULT_GAS_COEFFICIENT } from "~Common/Constant/Thor/ThorConstants"
import { RootState } from "~Storage/Redux/Types"
import { useAppSelector } from "~Storage/Redux"

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

    const [gasFeeInVTHO, setFeeInVTHO] = useState<BigNumber>()

    /**
     * Effect hook to calculate the gas fee for a transaction.
     * The gas fee is calculated once the transaction receipt is available.
     */
    useEffect(() => {
        const gasBn = new BigNumber(activity.gasUsed)
        GasUtils.calculateFee(thor, gasBn, DEFAULT_GAS_COEFFICIENT)
            .then(res => {
                setFeeInVTHO(res)
            })
            .catch(() => showInfoToast("Info", "Gas fee may not be accurate."))
    }, [activity.gasUsed, thor])

    const VTHOexchangeRate = useAppSelector((state: RootState) =>
        selectCurrencyExchangeRate(state, VTHO.symbol),
    )

    /**
     * Converts the gas fee from wei to a human-readable format in VTHO.
     */
    const gasFeeInVTHOHumanReadable = useMemo(() => {
        return FormattingUtils.scaleNumberDown(
            gasFeeInVTHO ?? 0,
            VTHO.decimals,
            FormattingUtils.ROUND_DECIMAL_DEFAULT,
        )
    }, [gasFeeInVTHO])

    const fiatValueGasFeeSpent = useMemo(() => {
        if (VTHOexchangeRate?.rate)
            return FormattingUtils.humanNumber(
                FormattingUtils.convertToFiatBalance(
                    gasFeeInVTHOHumanReadable,
                    VTHOexchangeRate?.rate ?? 0,
                    VTHO.decimals,
                ),
                gasFeeInVTHOHumanReadable,
            )

        return undefined
    }, [VTHOexchangeRate?.rate, gasFeeInVTHOHumanReadable])

    return { gasFeeInVTHO, gasFeeInVTHOHumanReadable, fiatValueGasFeeSpent }
}
