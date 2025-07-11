import { useCallback, useMemo } from "react"
import { GasPriceCoefficient } from "~Constants"
import { EstimateGasResult } from "~Model"
import { BigNutils, GasUtils } from "~Utils"

type Args = {
    gas: EstimateGasResult | undefined
}

export const useLegacyFees = ({ gas }: Args) => {
    const getGasOption = useCallback(
        (coefficient: GasPriceCoefficient) => {
            return GasUtils.getTxFeeWithCoeff({
                gas: gas?.gas ?? 0,
                baseGasPrice: gas?.baseGasPrice ?? "0",
                gasPriceCoefficient: coefficient,
            })
        },
        [gas?.baseGasPrice, gas?.gas],
    )

    const options = useMemo(() => {
        const [regular, medium, high] = [
            getGasOption(GasPriceCoefficient.REGULAR),
            getGasOption(GasPriceCoefficient.MEDIUM),
            getGasOption(GasPriceCoefficient.HIGH),
        ]
        return {
            [GasPriceCoefficient.REGULAR]: {
                estimatedFee: regular.gasRaw,
                maxFee: regular.gasRaw,
                priorityFee: BigNutils("0"),
            },
            [GasPriceCoefficient.MEDIUM]: {
                estimatedFee: medium.gasRaw,
                maxFee: medium.gasRaw,
                priorityFee: BigNutils("0"),
            },
            [GasPriceCoefficient.HIGH]: {
                estimatedFee: high.gasRaw,
                maxFee: high.gasRaw,
                priorityFee: BigNutils("0"),
            },
        }
    }, [getGasOption])

    const txOptions = useMemo(
        () => ({
            [GasPriceCoefficient.REGULAR]: {
                gasPriceCoef: 0,
            },
            [GasPriceCoefficient.MEDIUM]: {
                gasPriceCoef: 127,
            },
            [GasPriceCoefficient.HIGH]: {
                gasPriceCoef: 255,
            },
        }),
        [],
    )

    const memoized = useMemo(
        () => ({ options, txOptions, isLoading: false, isFirstTimeLoading: false }),
        [options, txOptions],
    )

    return memoized
}
