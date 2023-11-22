import { GasPriceCoefficient, VTHO } from "~Constants"
import { AddressUtils, GasUtils, TransactionUtils } from "~Utils"
import { BigNumber } from "bignumber.js"
import { EstimateGasResult } from "~Model"
import { Transaction } from "thor-devkit"

type Props = {
    gas: EstimateGasResult | undefined
    selectedFeeOption: string
    clauses: Transaction.Clause[]
    isDelegated: boolean
    vtho: any
}

export const calculateIsEnoughGas = ({ gas, selectedFeeOption, clauses, isDelegated, vtho }: Props) => {
    const calculateFeeByCoefficient = (coefficient: GasPriceCoefficient) =>
        GasUtils.gasToVtho({
            gas: new BigNumber(gas?.gas || 0),
            baseGasPrice: new BigNumber(gas?.baseGasPrice || "0"),
            gasPriceCoefficient: coefficient,
            decimals: 2,
        })

    const gasFeeOptionsRaw = {
        [GasPriceCoefficient.REGULAR]: calculateFeeByCoefficient(GasPriceCoefficient.REGULAR).gasRaw,
        [GasPriceCoefficient.MEDIUM]: calculateFeeByCoefficient(GasPriceCoefficient.MEDIUM).gasRaw,
        [GasPriceCoefficient.HIGH]: calculateFeeByCoefficient(GasPriceCoefficient.HIGH).gasRaw,
    }

    const vthoGasFeeRaw = gasFeeOptionsRaw[Number(selectedFeeOption) as GasPriceCoefficient]

    const vthoTransferClauses = clauses.filter(
        clause =>
            clause.to &&
            AddressUtils.compareAddresses(clause.to, VTHO.address) &&
            TransactionUtils.isTokenTransferClause(clause),
    )

    let txCostTotal = new BigNumber(isDelegated ? 0 : vthoGasFeeRaw ?? 0)
    let isEnoughGas = true

    for (const clause of vthoTransferClauses) {
        // Get the amount of VTHO being transferred
        const clauseAmount = TransactionUtils.getAmountFromClause(clause)

        // Get totl cost of transaction (amount + fee)
        if (clauseAmount) {
            txCostTotal = txCostTotal.plus(clauseAmount)
        }

        // Get total balance of VTHO
        const totalBalance = new BigNumber(vtho.balance.balance)
        // Check if the total cost of the transaction is less than or equal to the total balance of VTHO
        isEnoughGas = totalBalance.isGreaterThanOrEqualTo(txCostTotal)
    }

    return { isGas: isEnoughGas, txCostTotal }
}

/*
    if(amount + fee > vtho balance){
        amount = Math.max(vtho balance - fee, 0)
    }
*/

// // Helper function to convert a float to a BigNumber
// function convertFloatToBigNumber(value: string) {
//     // Ensure BigNumber doesn't use exponential notation
//     BigNumber.config({ EXPONENTIAL_AT: 1e9 })
//     // Create a BigNumber instance
//     const newBN = new BigNumber(value)
//     // Round the number to 18 decimal places
//     const roundedBN = newBN.decimalPlaces(18)
//     // Now, we want to remove the decimal places by multiplying by 10^18 to shift the decimal point
//     const scaleFactor = new BigNumber(10).pow(18)
//     // Multiply by the scaleFactor to shift decimal places
//     const result = roundedBN.multipliedBy(scaleFactor)
//     // Ensure the result is in normal (not exponential) notation and rounded to 18 decimal places
//     return result.toFixed() // This should log a big number with up to 18 decimal places
// }
