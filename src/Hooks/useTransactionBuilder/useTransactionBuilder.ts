import { useCallback } from "react"
import { HexUtils, TransactionUtils } from "~Utils"
import { Transaction } from "thor-devkit"
import { EstimateGasResult } from "~Model"
import { selectChainTag, useAppSelector } from "~Storage/Redux"
import { selectBlockRef } from "~Storage/Redux/Selectors/Beat"

type Props = {
    providedGas?: number
    gas?: EstimateGasResult
    clauses: Transaction.Body["clauses"]
    isDelegated: boolean
    dependsOn?: string
}

export const useTransactionBuilder = ({
    providedGas,
    gas,
    dependsOn,
    clauses,
    isDelegated,
}: Props) => {
    const blockRef = useAppSelector(selectBlockRef)
    const chainTag = useAppSelector(selectChainTag)

    return useCallback(() => {
        const nonce = HexUtils.generateRandom(8)

        const txGas = providedGas ?? gas?.gas

        if (!txGas) throw new Error("Transaction gas is not ready")

        const DEFAULT_GAS_COEFFICIENT = 0
        const txBody: Transaction.Body = {
            chainTag,
            blockRef,
            // 5 minutes
            expiration: 30,
            clauses: clauses,
            gasPriceCoef: DEFAULT_GAS_COEFFICIENT,
            gas: txGas,
            dependsOn: dependsOn ?? null,
            nonce: nonce,
        }

        return TransactionUtils.fromBody(txBody, isDelegated)
    }, [isDelegated, clauses, dependsOn, gas, providedGas, blockRef, chainTag])
}
