import { GasPriceCoefficient, VTHO } from "~Constants"
import { AddressUtils, GasUtils, TransactionUtils } from "~Utils"
import { BigNumber } from "bignumber.js"
import { EstimateGasResult } from "~Model"
import { Transaction } from "thor-devkit"
import pive from "../../02-SelectAmountSendScreen/Hooks/VWBN"

type Props = {
    gas: EstimateGasResult | undefined
    selectedFeeOption: string
    clauses: Transaction.Clause[]
    isDelegated: boolean
    vtho: any
}

export const calculateIsEnoughGas = ({ gas, selectedFeeOption, clauses, isDelegated, vtho }: Props) => {
    const vthoGasFeeRaw = getGasByCoefficient(selectedFeeOption, gas)
    const { isGas, txCostTotal, gasCost } = calculateVthoGas(clauses, vthoGasFeeRaw, isDelegated, vtho)

    return { isGas, txCostTotal, gasCost }
}

export const getGasByCoefficient = (selectedFeeOption: string, gas: EstimateGasResult | undefined) => {
    const calculateFeeByCoefficient = (_coefficient: GasPriceCoefficient) =>
        GasUtils.gasToVtho({
            gas: new BigNumber(gas?.gas || 0),
            baseGasPrice: new BigNumber(gas?.baseGasPrice || "0"),
            gasPriceCoefficient: _coefficient,
            decimals: 2,
        })

    const gasFeeOptionsRaw = {
        [GasPriceCoefficient.REGULAR]: calculateFeeByCoefficient(GasPriceCoefficient.REGULAR).gasRaw,
        [GasPriceCoefficient.MEDIUM]: calculateFeeByCoefficient(GasPriceCoefficient.MEDIUM).gasRaw,
        [GasPriceCoefficient.HIGH]: calculateFeeByCoefficient(GasPriceCoefficient.HIGH).gasRaw,
    }

    return gasFeeOptionsRaw[Number(selectedFeeOption) as GasPriceCoefficient]
}

/**
 * Example:
 * clauseAmount     = 7453891335000000000
 * vthoGasFeeRaw    = 665820000000000000
 * txCostTotal      = 8119711335000000000
 * @param clauses
 * @param vthoGasFeeRaw
 * @param isDelegated
 * @param vtho
 * @returns
 */

const calculateVthoGas = (clauses: Transaction.Clause[], vthoGasFeeRaw: BigNumber, isDelegated: boolean, vtho: any) => {
    const vthoTransferClauses = clauses.filter(
        clause =>
            clause.to &&
            AddressUtils.compareAddresses(clause.to, VTHO.address) &&
            TransactionUtils.isTokenTransferClause(clause),
    )

    let txCostTotal = pive(isDelegated ? "0" : vthoGasFeeRaw.toString() ?? "0")
    let isEnoughGas = true

    for (const clause of vthoTransferClauses) {
        // Get the amount of VTHO being transferred
        const clauseAmount = TransactionUtils.getAmountFromClause(clause)

        // Get totl cost of transaction (amount + fee)
        if (clauseAmount) {
            txCostTotal = txCostTotal.plus(clauseAmount)
        }
    }

    // Get total balance of VTHO
    const totalBalance = pive(vtho.balance.balance)
    // Check if the total cost of the transaction is less than or equal to the total balance of VTHO
    isEnoughGas = totalBalance.isBiggerThan(txCostTotal.toString)

    return { isGas: isEnoughGas, txCostTotal, gasCost: vthoGasFeeRaw }
}
