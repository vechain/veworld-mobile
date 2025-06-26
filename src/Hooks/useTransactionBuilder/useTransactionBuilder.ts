import { useCallback } from "react"
import { HexUtils } from "~Utils"
import { DEVICE_TYPE, EstimateGasResult } from "~Model"
import { useThor } from "~Components"
import { GasPriceCoefficient } from "~Constants"
import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { useVechainWallet } from "~VechainWalletKit"
import { selectDevice, selectSelectedAccount, useAppSelector } from "../../Storage/Redux"

type Props = {
    providedGas?: number
    gas?: EstimateGasResult
    clauses: TransactionClause[]
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
    const account = useAppSelector(selectSelectedAccount)
    const senderDevice = useAppSelector(state => selectDevice(state, account.rootAddress))
    const { buildTransaction: socialLoginBuildTransaction } = useVechainWallet()

    const buildTransaction = useCallback(async () => {
        const nonce = HexUtils.generateRandom(8)

        const txGas = gas?.gas ?? 0

        if (senderDevice?.type === DEVICE_TYPE.SOCIAL) {
            return await socialLoginBuildTransaction(clauses, {
                gas: txGas,
                isDelegated,
                dependsOn,
                gasPriceCoef,
            })
        }

        return Transaction.of({
            chainTag: parseInt(thor.genesis.id.slice(-2), 16),
            blockRef: thor.status.head.id.slice(0, 18),
            // 5 minutes
            expiration: 30,
            clauses: clauses,
            gasPriceCoef,
            gas: txGas,
            dependsOn: dependsOn ?? null,
            nonce: nonce,
            ...(isDelegated && {
                reserved: {
                    features: 1,
                },
            }),
        })
    }, [
        gas?.gas,
        thor.genesis.id,
        thor.status.head.id,
        clauses,
        gasPriceCoef,
        dependsOn,
        isDelegated,
        senderDevice?.type,
        socialLoginBuildTransaction,
    ])

    return {
        buildTransaction,
    }
}
