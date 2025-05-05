import moment from "moment"
import { useMemo, useState } from "react"
import { GasPriceCoefficient } from "~Constants"
import { EstimateGasResult } from "~Model"
import { BigNumberUtils, GasUtils } from "~Utils"

type Props = {
    coefficient: GasPriceCoefficient
    gas: EstimateGasResult | undefined
}

export type TransactionFeesResult = Record<
    GasPriceCoefficient,
    {
        estimatedFee: BigNumberUtils
        maxFee: BigNumberUtils
        priorityFee: BigNumberUtils
    }
>

export const useTransactionFees = (props: Props) => {
    const [isLoading, _] = useState(false)

    const gasResult = useMemo(
        () => GasUtils.getGasByCoefficient({ gas: props.gas, selectedFeeOption: props.coefficient.toString() }),
        [props.coefficient, props.gas],
    )

    const options = useMemo(() => {
        return {
            [GasPriceCoefficient.REGULAR]: {
                estimatedFee: gasResult.gasFeeOptions[GasPriceCoefficient.REGULAR].gasRaw,
                maxFee: gasResult.gasFeeOptions[GasPriceCoefficient.REGULAR].gasRaw,
                priorityFee: gasResult.priorityFees.gasRaw,
            },
            [GasPriceCoefficient.MEDIUM]: {
                estimatedFee: gasResult.gasFeeOptions[GasPriceCoefficient.MEDIUM].gasRaw,
                maxFee: gasResult.gasFeeOptions[GasPriceCoefficient.MEDIUM].gasRaw,
                priorityFee: gasResult.priorityFees.gasRaw,
            },
            [GasPriceCoefficient.HIGH]: {
                estimatedFee: gasResult.gasFeeOptions[GasPriceCoefficient.HIGH].gasRaw,
                maxFee: gasResult.gasFeeOptions[GasPriceCoefficient.HIGH].gasRaw,
                priorityFee: gasResult.priorityFees.gasRaw,
            },
        }
    }, [gasResult.gasFeeOptions, gasResult.priorityFees.gasRaw])

    const result = useMemo(() => {
        return {
            estimatedFee: gasResult.gasFeeOptions[props.coefficient].gasRaw,
            maxFee: gasResult.gasFeeOptions[props.coefficient].gasRaw,
            gasPriceCoef: gasResult.gasPriceCoef,
            priorityFee: gasResult.priorityFees.gasRaw,
        }
    }, [gasResult, props.coefficient])

    const memoized = useMemo(
        () => ({ ...result, options, isLoading, dataUpdatedAt: moment().valueOf() }),
        [isLoading, result, options],
    )

    return memoized
}
