import { useCallback } from "react"
import { HexUtils, TransactionUtils } from "~Utils"
import { Transaction } from "thor-devkit"
import { EstimateGasResult } from "~Model"
import { useThor } from "~Components"

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
    const thor = useThor()

    const buildTransaction = useCallback(() => {
        const nonce = HexUtils.generateRandom(8)

        const txGas = providedGas ?? gas?.gas

        if (!txGas) throw new Error("Transaction gas is not ready")

        const DEFAULT_GAS_COEFFICIENT = 0
        const txBody: Transaction.Body = {
            chainTag: parseInt(thor.genesis.id.slice(-2), 16),
            blockRef: thor.status.head.id.slice(0, 18),
            // 5 minutes
            expiration: 30,
            clauses: clauses,
            gasPriceCoef: DEFAULT_GAS_COEFFICIENT,
            gas: txGas,
            dependsOn: dependsOn ?? null,
            nonce: nonce,
        }

        return TransactionUtils.fromBody(txBody, isDelegated)
    }, [
        isDelegated,
        clauses,
        dependsOn,
        gas,
        providedGas,
        thor.status.head.id,
        thor.genesis.id,
    ])

    return {
        buildTransaction,
    }
}
