import { BigNumber } from "bignumber.js"
import { useEffect, useMemo, useState } from "react"

import { useTransactionGas } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { TransactionUtils } from "~Utils"
import { calculateIsEnoughGas } from "../../04-TransactionSummarySendScreen/Helpers"
import { useIsFocused } from "@react-navigation/native"

const address = "0x0000000000000000000000000000506172616d73"

export const useCalculateGas = ({ token }: { token: FungibleTokenWithBalance }) => {
    const isFocus = useIsFocused()
    const [_gas, setGas] = useState(new BigNumber(0))

    const clauses = useMemo(() => TransactionUtils.prepareFungibleClause("1", token, address), [token])

    const { gas } = useTransactionGas({
        clauses,
    })

    useEffect(() => {
        if (isFocus) {
            const { gasCost } = calculateIsEnoughGas({
                selectedFeeOption: "0",
                gas,
                clauses,
                isDelegated: false,
                vtho: token,
            })

            setGas(gasCost)
        }
    }, [clauses, gas, isFocus, token])

    // console.log({ oldGas: _gas.toString() })

    return { gas: _gas }
}
