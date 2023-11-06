import React, { useCallback, useMemo } from "react"
import { FormattingUtils, GasUtils } from "~Utils"
import { GasPriceCoefficient, VTHO } from "~Constants"

import {
    selectVthoTokenWithBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { EstimateGasResult } from "~Model"
import { BigNumber } from "bignumber.js"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import {
    getAmountFromClause,
    isTokenTransferClause,
} from "~Utils/TransactionUtils/TransactionUtils"
import { Transaction } from "thor-devkit"

export const useRenderGas = ({
    gas,
    accountAddress,
    clauses,
    isDelegated,
}: {
    gas: EstimateGasResult | undefined
    accountAddress: string
    clauses: Transaction.Body["clauses"]
    isDelegated: boolean
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
        const vthoTransferClauses = clauses.filter(
            clause =>
                clause.to &&
                compareAddresses(clause.to, VTHO.address) &&
                isTokenTransferClause(clause),
        )

        let txCost = new BigNumber(isDelegated ? 0 : gas?.gas ?? 0)

        for (const clause of vthoTransferClauses) {
            const clauseAmount = getAmountFromClause(clause)

            if (clauseAmount) txCost = txCost.plus(clauseAmount)
        }

        const balance = new BigNumber(vthoBalance)

        return balance.isGreaterThanOrEqualTo(txCost)
    }, [isDelegated, clauses, gas?.gas, vthoBalance])

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
