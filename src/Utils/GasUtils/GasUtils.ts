import BigNumber from "bignumber.js"
import { Transaction } from "thor-devkit"
import { abis, BASE_GAS_PRICE } from "~Constants"
import { EstimateGasResult } from "~Model"

const paramsCache: Record<string, string> = {}

const getBaseGasPrice = async (thor: Connex.Thor): Promise<string> => {
    const k = `${thor.genesis.id}-${BASE_GAS_PRICE}`
    if (paramsCache[k]) {
        return paramsCache[k]
    } else {
        const address = "0x0000000000000000000000000000506172616d73"
        const result = await thor
            .account(address)
            .method(abis.paramsGet)
            .cache([address])
            .call(BASE_GAS_PRICE)

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
    const offeredGas = suggestedGas
        ? Math.max(suggestedGas - intrinsicGas, 1)
        : 2000 * 10000
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

const calculateFee = async (
    thor: Connex.Thor,
    gas: BigNumber | number,
    gasPriceCoef: number,
): Promise<BigNumber> => {
    const baseGasPrice = await getBaseGasPrice(thor)
    return new BigNumber(baseGasPrice)
        .times(gasPriceCoef)
        .idiv(255)
        .plus(baseGasPrice)
        .times(gas)
}

export default {
    estimateGas,
    calculateFee,
}
