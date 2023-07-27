import { useCallback, useEffect, useMemo, useState } from "react"
import { Transaction } from "thor-devkit"

import { debug, error, GasUtils, HexUtils } from "~Utils"
import { useThor } from "~Components"
import { EstimateGasResult } from "~Model"
import {
    selectChainTag,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { selectBlockRef } from "~Storage/Redux/Selectors/Beat"

type UseTransactionReturnProps = {
    gas?: EstimateGasResult
    setGas: (gas: EstimateGasResult) => void
    createTransactionBody: () => Transaction.Body
    loadingGas: boolean
    setGasPayer: (gasPayer: string) => void
}

type Props = {
    clauses: Transaction.Body["clauses"]
    providedGasPayer?: string
    dependsOn?: string
    providedGas?: number
}

/**
 * Hook to calculate gas and generate the transaction body based on token, amount and address
 * @param clauses - the clauses to create the transaction with
 * @param dependsOn - the transaction hash to depend on
 * @param providedGas - the gas to use for the transaction
 * @param providedGasPayer - the gas payer to use for the transaction
 */
export const useTransaction = ({
    clauses,
    dependsOn,
    providedGas,
    providedGasPayer,
}: Props): UseTransactionReturnProps => {
    const [loadingGas, setLoadingGas] = useState<boolean>(true)
    const [gas, setGas] = useState<EstimateGasResult>()
    const account = useAppSelector(selectSelectedAccount)
    const [gasPayer, setGasPayer] = useState<string>(
        providedGasPayer ?? account.address,
    )
    const blockRef = useAppSelector(selectBlockRef)
    const chainTag = useAppSelector(selectChainTag)
    const thorClient = useThor()

    const nonce = useMemo(() => HexUtils.generateRandom(8), [])

    /**
     * Recalculate transaction on data changes
     */
    const createTransactionBody = useCallback((): Transaction.Body => {
        if (!blockRef) throw new Error("Block ref not found")
        const DEFAULT_GAS_COEFFICIENT = 0
        return {
            chainTag,
            blockRef,
            // 5 minutes
            expiration: 30,
            clauses: clauses,
            gasPriceCoef: DEFAULT_GAS_COEFFICIENT,
            gas: providedGas ?? gas?.gas ?? "0",
            dependsOn: dependsOn ?? null,
            nonce: nonce,
        }
    }, [clauses, dependsOn, nonce, blockRef, chainTag, gas?.gas, providedGas])

    const estimateGas = useCallback(
        async (caller: string, payer: string, thor: Connex.Thor) => {
            setLoadingGas(true)
            try {
                const estimatedGas = await GasUtils.estimateGas(
                    thor,
                    clauses,
                    providedGas ?? 0, // NOTE: suggestedGas: 0;  in extension it was fixed 0
                    caller,
                    payer,
                )

                setGas(estimatedGas)
            } catch (e) {
                error(e)
            } finally {
                setLoadingGas(false)
            }
        },
        [clauses, providedGas],
    )

    useEffect(() => {
        debug("Estimating Gas")
        estimateGas(account.address, gasPayer, thorClient)
    }, [account.address, gasPayer, clauses, estimateGas, thorClient])

    return { gas, loadingGas, setGas, createTransactionBody, setGasPayer }
}
