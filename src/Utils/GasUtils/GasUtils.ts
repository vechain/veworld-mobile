import { TransactionClause } from "@vechain/sdk-core"
import axios from "axios"
import BigNumber from "bignumber.js"
import { Transaction } from "thor-devkit"
import { GasPriceCoefficient, MAX_TX_GAS_LIMIT, VTHO } from "~Constants"
import { EstimateGasResult } from "~Model"
import AddressUtils from "~Utils/AddressUtils"
import BigNutils, { BigNumberUtils } from "~Utils/BigNumberUtils"
import SemanticVersionUtils from "~Utils/SemanticVersionUtils"
import TransactionUtils from "~Utils/TransactionUtils"

const SIMULATION_GAS = 2000 * 10000
const GAS_HEADROOM = 15000
const CALL_DEPTH_PROBES = 4
const BISECT_ROUNDS = 8

type Simulate = (gas: number) => Promise<Connex.VM.Output[]>

const anyReverted = (outputs: Connex.VM.Output[]) => outputs.some(out => out.reverted)

// EIP-150: each call hop keeps 1/64 of the gas, which the 20M simulation hides. Undefined when nothing up to maxExecGas passes.
const verifyExecGas = async (simulate: Simulate, execGas: number, maxExecGas: number): Promise<number | undefined> => {
    let gas = execGas + GAS_HEADROOM
    if (gas > maxExecGas) return undefined
    if (!anyReverted(await simulate(gas))) return gas

    let lo = gas
    for (let hop = 0; hop < CALL_DEPTH_PROBES; hop++) {
        gas = Math.min(Math.ceil((gas * 64) / 63), maxExecGas)
        if (!anyReverted(await simulate(gas))) return gas
        if (gas === maxExecGas) return undefined
        lo = gas
    }
    let hi = maxExecGas
    if (anyReverted(await simulate(hi))) return undefined
    for (let round = 0; round < BISECT_ROUNDS; round++) {
        const mid = Math.floor((lo + hi) / 2)
        if (anyReverted(await simulate(mid))) {
            lo = mid
        } else {
            hi = mid
        }
    }
    return hi
}

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

    const maxExecGas = MAX_TX_GAS_LIMIT - intrinsicGas

    const simulate: Simulate = async gas => {
        const { data } = await axios.post<Connex.VM.Output[]>(`${url}/accounts/*?revision=${revision}`, {
            clauses,
            caller,
            gas,
            gasPayer,
        })
        return data
    }

    const data = await simulate(providedGas ? Math.max(providedGas - intrinsicGas, 1) : SIMULATION_GAS)

    let gas = providedGas
    let exceedsTxGasLimit = false

    if (gas) {
        exceedsTxGasLimit = gas > MAX_TX_GAS_LIMIT
    } else {
        const execGas = data.reduce((sum, out) => sum + out.gasUsed, 0)
        let execBudget = execGas ? execGas + GAS_HEADROOM : 0
        if (execGas && !anyReverted(data)) {
            const verified = await verifyExecGas(simulate, execGas, maxExecGas)
            if (verified !== undefined) execBudget = verified
            else exceedsTxGasLimit = true
        } else if (execBudget > maxExecGas) {
            exceedsTxGasLimit = true
        }
        gas = intrinsicGas + execBudget
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
        outputs: data,
        exceedsTxGasLimit,
    }
}

const formatGasMillions = (gas: number) => `${(gas / 1e6).toFixed(1)}M`

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
    formatGasMillions,
    gasToVtho,
    getTxFeeWithCoeff,
    getGasByCoefficient,
    calculateIsEnoughGas,
}
