import { useCallback } from "react"
import { BigNumberUtils, HexUtils } from "~Utils"
import { DEVICE_TYPE, EstimateGasResult } from "~Model"
import { useThor } from "~Components"
import { GasPriceCoefficient } from "~Constants"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { useSmartWallet } from "../../VechainWalletKit"

type Props = {
    providedGas?: number
    gas?: EstimateGasResult
    clauses: TransactionClause[]
    isDelegated: boolean
    dependsOn?: string
    gasPriceCoef?: number
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
    deviceType: DEVICE_TYPE
    genericDelgation: {
        token: string
        isGenDelegation: boolean
        amount: BigNumberUtils | undefined
        delegatorAddress: string
    }
}

export const useTransactionBuilder = ({
    gas,
    dependsOn,
    clauses,
    isDelegated,
    gasPriceCoef = GasPriceCoefficient.REGULAR,
    maxPriorityFeePerGas,
    maxFeePerGas,
    deviceType,
    genericDelgation,
}: Props) => {
    const thor = useThor()
    const { buildTransaction: buildTransactionWithSmartWallet } = useSmartWallet()

    const buildTransaction = useCallback(async () => {
        const nonce = HexUtils.generateRandom(8)

        const txGas = gas?.gas ?? 0

        if (deviceType === DEVICE_TYPE.SMART_WALLET) {
            console.log("buildTransaction genericDelgation clauses", clauses?.length)
            return buildTransactionWithSmartWallet(
                clauses,
                {
                    maxFeePerGas: `0x${BigInt(maxFeePerGas ?? 0).toString(16)}`,
                    maxPriorityFeePerGas: `0x${BigInt(maxPriorityFeePerGas ?? 0).toString(16)}`,
                    isDelegated,
                    gasPriceCoef,
                },
                genericDelgation,
            )
        }

        return Transaction.of({
            chainTag: parseInt(thor.genesis.id.slice(-2), 16),
            blockRef: thor.status.head.id.slice(0, 18),
            // ~16 minutes
            expiration: 100,
            clauses: clauses,
            gas: txGas,
            //Logical OR since it could happen that it's an empty string
            dependsOn: dependsOn || null,
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
        deviceType,
        buildTransactionWithSmartWallet,
        genericDelgation,
    ])

    return {
        buildTransaction,
    }
}
