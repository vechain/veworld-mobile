import { useEffect, useMemo, useState } from "react"
import { useTransactionGas } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { GasUtils, TransactionUtils } from "~Utils"
import { useIsFocused } from "@react-navigation/native"
import { GasPriceCoefficient } from "~Constants"

const address = "0x0000000000000000000000000000506172616d73"

export const useCalculateGas = ({ token }: { token: FungibleTokenWithBalance }) => {
    const isFocus = useIsFocused()
    const [_gas, setGas] = useState("0")

    const clauses = useMemo(() => TransactionUtils.prepareFungibleClause("1", token, address), [token])

    const { gas } = useTransactionGas({
        clauses,
    })

    const { priorityFees } = useMemo(
        () =>
            GasUtils.getGasByCoefficient({
                gas,
                selectedFeeOption: String(GasPriceCoefficient.REGULAR),
            }),
        [gas],
    )

    useEffect(() => {
        if (isFocus) {
            /*
                VeChainThor calculates gas cost based on the work needed to be done.
                Different addresses and amounts influnce the work needed to be done and will generate different gas costs.
            */
            //! add a bit of gas to the gas cost to make sure it's enough
            const bufferGas = {
                ...priorityFees,
                gasRaw: priorityFees.gasRaw.plus(10000),
            }

            const { gasCost } = GasUtils.calculateIsEnoughGas({
                clauses,
                isDelegated: false,
                vtho: token,
                priorityFees: bufferGas,
            })

            setGas(gasCost?.gasRaw.toString ?? "0")
        }
    }, [clauses, gas, isFocus, priorityFees, token])

    return { gas: _gas }
}
