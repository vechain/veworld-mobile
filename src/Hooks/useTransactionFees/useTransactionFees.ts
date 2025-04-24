import { useMemo, useState } from "react"
import { GasPriceCoefficient } from "~Constants"
import { EstimateGasResult } from "~Model"
import { GasUtils } from "~Utils"

type Props = {
    coefficient: GasPriceCoefficient
    gas: EstimateGasResult | undefined
}

export const useTransactionFees = (props: Props) => {
    const [isLoading, _] = useState(false)
    const result = useMemo(() => {
        const r = GasUtils.getGasByCoefficient({ gas: props.gas, selectedFeeOption: props.coefficient.toString() })
        return {
            estimatedFee: r.gasFeeOptions[props.coefficient],
            maxFee: r.gasFeeOptions[props.coefficient],
            gasPriceCoef: r.gasPriceCoef,
            priorityFee: r.priorityFees.gasRaw,
        }
    }, [props.coefficient, props.gas])

    const memoized = useMemo(() => ({ ...result, isLoading }), [isLoading, result])

    return memoized
}
