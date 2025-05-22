import { TransactionClause } from "@vechain/sdk-core"
import axios from "axios"
import BigNumber from "bignumber.js"
import { Transaction } from "thor-devkit"
import { GasPriceCoefficient, VTHO } from "~Constants"
import { EstimateGasResult } from "~Model"
import AddressUtils from "~Utils/AddressUtils"
import BigNutils, { BigNumberUtils } from "~Utils/BigNumberUtils"
import SemanticVersionUtils from "~Utils/SemanticVersionUtils"
import TransactionUtils from "~Utils/TransactionUtils"

const estimateGas = async (
    url: string,
    clauses: TransactionClause[],
    providedGas: number,
    caller: string,
    gasPayer?: string,
): Promise<EstimateGasResult> => {
    const intrinsicGas = Transaction.intrinsicGas(
        clauses.map(item => {
            return {
                to: item.to,
                value: item.value || "0x0",
                data: item.data || "0x",
            }
        }),
    )

    const genesis = await axios.get<Connex.Thor.Block>(`${url}/blocks/best`)

    let revision = "best"

    if (genesis.headers.get && typeof genesis.headers.get === "function") {
        const thorVersion = genesis.headers.get("x-thorest-ver")

        if (typeof thorVersion === "string" && SemanticVersionUtils.moreThanOrEqual(thorVersion, "2.1.3")) {
            revision = "next"
        }
    }

    const offeredGas = providedGas ? Math.max(providedGas - intrinsicGas, 1) : 2000 * 10000

    const { data } = await axios.post<Connex.VM.Output[]>(`${url}/accounts/*?revision=${revision}`, {
        clauses,
        caller,
        gas: offeredGas,
        gasPayer,
    })

    let gas = providedGas

    if (!gas) {
        const execGas = data.reduce((sum, out) => sum + out.gasUsed, 0)
        gas = intrinsicGas + (execGas ? execGas + 15000 : 0)
    }
    const lastOutput = data.slice().pop()

    return {
        caller,
        gas,
        reverted: lastOutput ? lastOutput.reverted : false,
        revertReason: getRevertReason(lastOutput),
        vmError: lastOutput ? lastOutput.vmError : "",
        //We can easily hard code it
        baseGasPrice: "10000000000000",
    }
}

const getRevertReason = (output: Connex.VM.Output | undefined): string => {
    if (output) {
        if (output.revertReason) {
            return output.revertReason
        }
        if (output.vmError) return output.vmError
    }
    return ""
}

/**
 * Calculate the transaction fee based on gas usage, base gas price, and gas price coefficient.
 *
 * @param {BigNumber} gas - The amount of gas consumed by the transaction.
 * @param {BigNumber} baseGasPrice - The base gas price in string format.
 * @param {BigNumber} gasPriceCoefficient - The gas price coefficient to apply.
 * @returns {number} - The calculated transaction fee.
 */
export function gasToVtho({
    gas,
    baseGasPrice,
    gasPriceCoefficient = GasPriceCoefficient.REGULAR,
}: {
    gas: BigNumber
    baseGasPrice: BigNumber
    gasPriceCoefficient?: GasPriceCoefficient
}) {
    const rawVtho = new BigNumber(baseGasPrice) // ex: 210000000000000000
        .times(gasPriceCoefficient || GasPriceCoefficient.REGULAR)
        .idiv(255)
        .plus(baseGasPrice)
        .times(gas)

    // transform to VTHO ex: 0.21
    return {
        gasFee: BigNutils(rawVtho).toHuman(VTHO.decimals).decimals(2).toString,
        gasRaw: rawVtho,
    }
}

export function getTxFeeWithCoeff({
    gas,
    baseGasPrice,
    gasPriceCoefficient = GasPriceCoefficient.REGULAR,
}: {
    gas: string | number
    baseGasPrice: string | number
    gasPriceCoefficient?: GasPriceCoefficient
    decimals?: number
}) {
    const rawVtho = BigNutils(baseGasPrice)
        .times(gasPriceCoefficient || GasPriceCoefficient.REGULAR)
        .idiv(255)
        .plus(baseGasPrice)
        .times(gas)

    // transform to VTHO ex: 0.21
    return {
        gasFee: BigNutils(rawVtho.toString).toHuman(VTHO.decimals).decimals(2).toString,
        gasRaw: rawVtho,
    }
}

export const getGasByCoefficient = ({
    gas,
    selectedFeeOption,
}: {
    gas: EstimateGasResult | undefined
    selectedFeeOption: string
}) => {
    const calculateFeeByCoefficient = (coefficient: GasPriceCoefficient) =>
        getTxFeeWithCoeff({
            gas: gas?.gas ?? 0,
            baseGasPrice: gas?.baseGasPrice ?? "0",
            gasPriceCoefficient: coefficient,
        })

    const gasFeeOptions = {
        [GasPriceCoefficient.REGULAR]: calculateFeeByCoefficient(GasPriceCoefficient.REGULAR),
        [GasPriceCoefficient.MEDIUM]: calculateFeeByCoefficient(GasPriceCoefficient.MEDIUM),
        [GasPriceCoefficient.HIGH]: calculateFeeByCoefficient(GasPriceCoefficient.HIGH),
    }

    const priorityFees = gasFeeOptions[Number(selectedFeeOption) as GasPriceCoefficient]

    return { gasPriceCoef: Number(selectedFeeOption), priorityFees, gasFeeOptions }
}

type Props = {
    clauses: Transaction.Clause[]
    isDelegated: boolean
    vtho: any
    txFee?: BigNumberUtils
    userSelectedAmount?: string
}

export const calculateIsEnoughGas = ({ clauses, isDelegated, vtho, txFee }: Props) =>
    calculateVthoGas(clauses, isDelegated, vtho, txFee)

const calculateVthoGas = (clauses: Transaction.Clause[], isDelegated: boolean, vtho: any, txFee?: BigNumberUtils) => {
    const vthoTransferClauses = clauses.filter(
        clause =>
            clause.to &&
            AddressUtils.compareAddresses(clause.to, VTHO.address) &&
            TransactionUtils.isTokenTransferClause(clause),
    )

    let txCostTotal = BigNutils(isDelegated ? "0" : txFee?.toString ?? "0")
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
    const totalBalance = BigNutils(vtho.balance.balance)
    // Check if the total cost of the transaction is less than or equal to the total balance of VTHO
    isEnoughGas = totalBalance.isBiggerThan(txCostTotal.toString)

    return { isGas: isEnoughGas, txCostTotal, gasCost: txFee }
}

export default {
    estimateGas,
    gasToVtho,
    getTxFeeWithCoeff,
    getGasByCoefficient,
    calculateIsEnoughGas,
}
