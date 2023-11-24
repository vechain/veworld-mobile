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

const calculateVthoGas = (clauses: Transaction.Clause[], vthoGasFeeRaw: BigNumber, isDelegated: boolean, vtho: any) => {
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
            txCostTotal = txCostTotal.plus(pive(clauseAmount).toHuman(18).toString)
        }
    }

    // Get total balance of VTHO
    const totalBalance = new BigNumber(vtho.balance.balance)
    // Check if the total cost of the transaction is less than or equal to the total balance of VTHO
    isEnoughGas = totalBalance.isGreaterThanOrEqualTo(txCostTotal)

    return { isGas: isEnoughGas, txCostTotal, gasCost: vthoGasFeeRaw }
}
