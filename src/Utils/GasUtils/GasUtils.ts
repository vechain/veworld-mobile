import BigNumber from "bignumber.js"
import { Transaction } from "thor-devkit"
import { abis, BASE_GAS_PRICE, GasPriceCoefficient, VTHO } from "~Constants"
import { EstimateGasResult } from "~Model"
import FormattingUtils from "~Utils/FormattingUtils"

const paramsCache: Record<string, string> = {}

const getBaseGasPrice = async (thor: Connex.Thor): Promise<string> => {
    const k = `${thor.genesis.id}-${BASE_GAS_PRICE}`
    if (paramsCache[k]) {
        return paramsCache[k]
    } else {
        const address = "0x0000000000000000000000000000506172616d73"
        const result = await thor.account(address).method(abis.paramsGet).cache([address]).call(BASE_GAS_PRICE)

        paramsCache[k] = result.data
        return result.data
    }
}

const estimateGas = async (
    thor: Connex.Thor,
    clauses: Connex.VM.Clause[],
    suggestedGas: number,
    caller: string,
    gasPayer?: string,
): Promise<EstimateGasResult> => {
    const intrinsicGas = Transaction.intrinsicGas(
        clauses.map(item => {
            return {
                to: item.to,
                value: item.value || 0,
                data: item.data || "0x",
            }
        }),
    )
    const offeredGas = suggestedGas ? Math.max(suggestedGas - intrinsicGas, 1) : 2000 * 10000
    const explainer = thor.explain(clauses).caller(caller).gas(offeredGas)

    if (gasPayer) {
        explainer.gasPayer(gasPayer)
    }

    const outputs = await explainer.execute()
    let gas = suggestedGas
    if (!gas) {
        const execGas = outputs.reduce((sum, out) => sum + out.gasUsed, 0)
        gas = intrinsicGas + (execGas ? execGas + 15000 : 0)
    }

    const baseGasPrice = await getBaseGasPrice(thor)
    const lastOutput = outputs.slice().pop()

    return {
        caller,
        gas,
        reverted: lastOutput ? lastOutput.reverted : false,
        revertReason: getRevertReason(lastOutput),
        vmError: lastOutput ? lastOutput.vmError : "",
        baseGasPrice,
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
    decimals = VTHO.decimals,
}: {
    gas: BigNumber
    baseGasPrice: BigNumber
    gasPriceCoefficient?: GasPriceCoefficient
    decimals?: number
}) {
    const rawVtho = new BigNumber(baseGasPrice) // ex: 210000000000000000
        .times(gasPriceCoefficient || GasPriceCoefficient.REGULAR)
        .idiv(255)
        .plus(baseGasPrice)
        .times(gas)

    // transform to VTHO ex: 0.21
    return FormattingUtils.scaleNumberDown(rawVtho, VTHO.decimals, decimals)
}

export default {
    getBaseGasPrice,
    estimateGas,
    gasToVtho,
}
