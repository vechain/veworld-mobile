import React, { useCallback, useMemo } from "react"
import { FormattingUtils, GasUtils } from "~Utils"
import { GasPriceCoefficient, VTHO } from "~Constants"

import {
    selectVthoTokenWithBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { EstimateGasResult } from "~Model"
import { BigNumber } from "bignumber.js"

export const useRenderGas = ({
    gas,
    tokenSymbol,
    amount,
    accountAddress,
}: {
    gas: EstimateGasResult | undefined
    tokenSymbol?: string
    amount?: string
    accountAddress: string
}) => {
    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(state, accountAddress),
    )
    const [selectedFeeOption, setSelectedFeeOption] = React.useState<string>(
        String(GasPriceCoefficient.REGULAR),
    )

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
            [GasPriceCoefficient.REGULAR]: calculateFeeByCoefficient(
                GasPriceCoefficient.REGULAR,
            ),
            [GasPriceCoefficient.MEDIUM]: calculateFeeByCoefficient(
                GasPriceCoefficient.MEDIUM,
            ),
            [GasPriceCoefficient.HIGH]: calculateFeeByCoefficient(
                GasPriceCoefficient.HIGH,
            ),
        }),
        [calculateFeeByCoefficient],
    )

    const vthoGasFee =
        gasFeeOptions[Number(selectedFeeOption) as GasPriceCoefficient]

    const vthoBalance = FormattingUtils.scaleNumberDown(
        vtho.balance.balance,
        vtho.decimals,
        2,
    )

    const isThereEnoughGas = useMemo(() => {
        let leftVtho = new BigNumber(vthoBalance)
        if (tokenSymbol === VTHO.symbol && amount) {
            leftVtho = leftVtho.minus(amount)
        }
        return !!(vthoGasFee && leftVtho.gte(vthoGasFee))
    }, [amount, vthoGasFee, tokenSymbol, vthoBalance])

    return {
        isThereEnoughGas,
        vthoGasFee,
        vthoBalance,
        gasPriceCoef: Number(selectedFeeOption),
        setSelectedFeeOption,
        selectedFeeOption,
        gasFeeOptions,
    }
}
