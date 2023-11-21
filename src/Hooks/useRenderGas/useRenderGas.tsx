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
    setAmount,
    userSelectedAmount,
}: {
    gas: EstimateGasResult | undefined
    accountAddress: string
    clauses: Transaction.Body["clauses"]
    isDelegated: boolean
    setAmount: React.Dispatch<React.SetStateAction<string>>
    userSelectedAmount: string
}) => {
    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(state, accountAddress),
    )
    const [selectedFeeOption, _setSelectedFeeOption] = React.useState<string>(
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
            ).gasFee,
            [GasPriceCoefficient.MEDIUM]: calculateFeeByCoefficient(
                GasPriceCoefficient.MEDIUM,
            ).gasFee,
            [GasPriceCoefficient.HIGH]: calculateFeeByCoefficient(
                GasPriceCoefficient.HIGH,
            ).gasFee,
        }),
        [calculateFeeByCoefficient],
    )

    const _gasFeeOptions = useMemo(
        () => ({
            [GasPriceCoefficient.REGULAR]: calculateFeeByCoefficient(
                GasPriceCoefficient.REGULAR,
            ).gasRaw,
            [GasPriceCoefficient.MEDIUM]: calculateFeeByCoefficient(
                GasPriceCoefficient.MEDIUM,
            ).gasRaw,
            [GasPriceCoefficient.HIGH]: calculateFeeByCoefficient(
                GasPriceCoefficient.HIGH,
            ).gasRaw,
        }),
        [calculateFeeByCoefficient],
    )

    const vthoGasFee =
        gasFeeOptions[Number(selectedFeeOption) as GasPriceCoefficient]

    const _vthoGasFee =
        _gasFeeOptions[Number(selectedFeeOption) as GasPriceCoefficient]

    const vthoBalance = FormattingUtils.scaleNumberDown(
        vtho.balance.balance,
        vtho.decimals,
        2,
    )

    const setSelectedFeeOption = useCallback(
        (value: string) => {
            _setSelectedFeeOption(value)

            const vthoTransferClauses = clauses.filter(
                clause =>
                    clause.to &&
                    compareAddresses(clause.to, VTHO.address) &&
                    isTokenTransferClause(clause),
            )

            let txCost = new BigNumber(isDelegated ? 0 : _vthoGasFee ?? 0)

            for (const clause of vthoTransferClauses) {
                const clauseAmount = getAmountFromClause(clause)

                if (clauseAmount) {
                    // if token to send is VTHO
                    if (
                        clause.to &&
                        compareAddresses(clause.to, VTHO.address)
                    ) {
                        const useAmountToBN =
                            convertFloatToBigNumber(userSelectedAmount)

                        setAmount(
                            FormattingUtils.scaleNumberDown(
                                new BigNumber(useAmountToBN)
                                    .minus(txCost)
                                    .toString(),
                                VTHO.decimals,
                                VTHO.decimals,
                            ),
                        )
                    }
                }
            }
        },
        [_vthoGasFee, clauses, isDelegated, setAmount, userSelectedAmount],
    )

    const isThereEnoughGas = useMemo(() => {
        const vthoTransferClauses = clauses.filter(
            clause =>
                clause.to &&
                compareAddresses(clause.to, VTHO.address) &&
                isTokenTransferClause(clause),
        )

        let txCost = new BigNumber(isDelegated ? 0 : _vthoGasFee ?? 0)

        for (const clause of vthoTransferClauses) {
            const clauseAmount = getAmountFromClause(clause)

            if (clauseAmount) {
                txCost = txCost.plus(clauseAmount)
            }
        }

        const balance = new BigNumber(vtho.balance.balance)

        return balance.isGreaterThanOrEqualTo(txCost)
    }, [clauses, isDelegated, _vthoGasFee, vtho.balance.balance])

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

/*
    clauseAmount / can be max or not
            if max && VTHO, gas is deducted from clauseAmount
            if not max, gas is not factored in


    _vthoGasFee / current gas selected option


    balance (vtho.balance.balance) / total vtho balance


    current calculation
        txCost = _vthoGasFee + clauseAmount
        balance >= txCost



    if VTHO





*/

function convertFloatToBigNumber(value: string) {
    // Ensure BigNumber doesn't use exponential notation
    BigNumber.config({ EXPONENTIAL_AT: 1e9 })

    // Create a BigNumber instance
    const newBN = new BigNumber(value)

    // Round the number to 18 decimal places
    const roundedBN = newBN.decimalPlaces(18)

    // Now, we want to remove the decimal places by multiplying by 10^18 to shift the decimal point
    const scaleFactor = new BigNumber(10).pow(18)

    // Multiply by the scaleFactor to shift decimal places
    const result = roundedBN.multipliedBy(scaleFactor)

    // Ensure the result is in normal (not exponential) notation and rounded to 18 decimal places
    return result.toFixed() // This should log a big number with up to 18 decimal places
}
