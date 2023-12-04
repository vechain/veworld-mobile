import React, { useCallback, useMemo } from "react"
import { GasUtils } from "~Utils"
import { GasPriceCoefficient } from "~Constants"
import { EstimateGasResult } from "~Model"
import { BigNumber } from "bignumber.js"

export const useRenderGas = ({ gas }: { gas: EstimateGasResult | undefined }) => {
    const [selectedFeeOption, setSelectedFeeOption] = React.useState<string>(String(GasPriceCoefficient.REGULAR))

    const calculateFeeByCoefficient = useCallback(
        (coefficient: GasPriceCoefficient) =>
            GasUtils.gasToVtho({
                gas: new BigNumber(gas?.gas || 0),
                baseGasPrice: new BigNumber(gas?.baseGasPrice || "0"),
                gasPriceCoefficient: coefficient,
                decimals: 2,
            }),
        [gas?.baseGasPrice, gas?.gas],
    )

    const gasFeeOptions = useMemo(
        () => ({
            [GasPriceCoefficient.REGULAR]: calculateFeeByCoefficient(GasPriceCoefficient.REGULAR).gasFee,
            [GasPriceCoefficient.MEDIUM]: calculateFeeByCoefficient(GasPriceCoefficient.MEDIUM).gasFee,
            [GasPriceCoefficient.HIGH]: calculateFeeByCoefficient(GasPriceCoefficient.HIGH).gasFee,
        }),
        [calculateFeeByCoefficient],
    )

    const vthoGasFee = useMemo(
        () => gasFeeOptions[Number(selectedFeeOption) as GasPriceCoefficient],
        [gasFeeOptions, selectedFeeOption],
    )

    return {
        vthoGasFee,
        gasPriceCoef: Number(selectedFeeOption),
        setSelectedFeeOption,
        selectedFeeOption,
        gasFeeOptions,
    }
}
