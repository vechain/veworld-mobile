import { useCallback } from "react"
import { HexUtils, TransactionUtils } from "~Utils"
import { Transaction } from "thor-devkit"
import { EstimateGasResult } from "~Model"
import { useThor } from "~Components"
import { GasPriceCoefficient } from "~Constants"

type Props = {
    providedGas?: number
    gas?: EstimateGasResult
    clauses: Transaction.Body["clauses"]
    isDelegated: boolean
    dependsOn?: string
    gasPriceCoef?: number
}

export const useTransactionBuilder = ({
    gas,
    dependsOn,
    clauses,
    isDelegated,
    gasPriceCoef = GasPriceCoefficient.REGULAR,
}: Props) => {
    const thor = useThor()

    const buildTransaction = useCallback(() => {
        const nonce = HexUtils.generateRandom(8)

        const txGas = gas?.gas

        if (!txGas) throw new Error("Transaction gas is not ready")

        const txBody: Transaction.Body = {
            chainTag: parseInt(thor.genesis.id.slice(-2), 16),
            blockRef: thor.status.head.id.slice(0, 18),
            // 5 minutes
            expiration: 30,
            clauses: clauses,
            gasPriceCoef,
            gas: txGas,
            dependsOn: dependsOn ?? null,
            nonce: nonce,
        }

        return TransactionUtils.fromBody(txBody, isDelegated)
    }, [gas?.gas, thor.genesis.id, thor.status.head.id, clauses, gasPriceCoef, dependsOn, isDelegated])

    return {
        buildTransaction,
    }
}
