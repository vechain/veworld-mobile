import { useCallback } from "react"
import { HexUtils } from "~Utils"
import { EstimateGasResult } from "~Model"
import { useThor } from "~Components"
import { GasPriceCoefficient } from "~Constants"
import { Transaction, TransactionClause } from "@vechain/sdk-core"

type Props = {
    providedGas?: number
    gas?: EstimateGasResult
    clauses: TransactionClause[]
    isDelegated: boolean
    dependsOn?: string
    gasPriceCoef?: number
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
}

export const useTransactionBuilder = ({
    gas,
    dependsOn,
    clauses,
    isDelegated,
    gasPriceCoef = GasPriceCoefficient.REGULAR,
    maxPriorityFeePerGas,
    maxFeePerGas,
}: Props) => {
    const thor = useThor()

    const buildTransaction = useCallback(() => {
        const nonce = HexUtils.generateRandom(8)

        const txGas = gas?.gas ?? 0

        return Transaction.of({
            chainTag: parseInt(thor.genesis.id.slice(-2), 16),
            blockRef: thor.status.head.id.slice(0, 18),
            // ~16 minutes
            expiration: 100,
            clauses: clauses,
            gas: txGas,
            dependsOn: dependsOn ?? null,
            nonce: nonce,
            ...(isDelegated && {
                reserved: {
                    features: 1,
                },
            }),
            ...(maxFeePerGas && maxPriorityFeePerGas
                ? {
                      maxFeePerGas: `0x${BigInt(maxFeePerGas).toString(16)}`,
                      maxPriorityFeePerGas: `0x${BigInt(maxPriorityFeePerGas).toString(16)}`,
                  }
                : {
                      gasPriceCoef,
                  }),
        })
    }, [
        gas?.gas,
        thor.genesis.id,
        thor.status.head.id,
        clauses,
        dependsOn,
        isDelegated,
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasPriceCoef,
    ])

    return {
        buildTransaction,
    }
}
