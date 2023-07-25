import { useCallback, useEffect, useMemo, useState } from "react"
import { Transaction } from "thor-devkit"

import { error, GasUtils, HexUtils } from "~Utils"
import { useThor } from "~Components"
import { EstimateGasResult } from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

type UseTransactionReturnProps = {
    gas?: EstimateGasResult
    setGas: (gas: EstimateGasResult) => void
    transactionBody: Transaction.Body
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
        providedGasPayer || account.address,
    )
    const thorClient = useThor()

    const nonce = useMemo(() => HexUtils.generateRandom(8), [])

    /**
     *  TODO: How should we handle the block REF if the user is slow in transacting?
     *  - We don't want it to change in case signatures have already been generated
     *  - Current expiration is 5 minutes below: "expiration: 30" blocks
     */
    const blockRef = useMemo(
        () => thorClient.status.head.id.slice(0, 18),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    /**
     * Recalculate transaction on data changes
     */
    const transactionBody = useMemo((): Transaction.Body => {
        const DEFAULT_GAS_COEFFICIENT = 0
        return {
            chainTag: parseInt(thorClient.genesis.id.slice(-2), 16),
            blockRef,
            // 5 minutes
            expiration: 30,
            clauses: clauses,
            gasPriceCoef: DEFAULT_GAS_COEFFICIENT,
            gas: providedGas || gas?.gas || "0",
            dependsOn: dependsOn || null,
            nonce: nonce,
        }
    }, [
        clauses,
        dependsOn,
        nonce,
        blockRef,
        thorClient.genesis.id,
        gas?.gas,
        providedGas,
    ])

    const estimateGas = useCallback(
        async (caller: string, payer: string, thor: Connex.Thor) => {
            setLoadingGas(true)
            try {
                const estimatedGas = await GasUtils.estimateGas(
                    thor,
                    clauses,
                    providedGas || 0, // NOTE: suggestedGas: 0;  in extension it was fixed 0
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
        estimateGas(account.address, gasPayer, thorClient)
        // We don't want to keep recalculating gas when thor changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account.address, gasPayer, clauses])

    return { gas, loadingGas, setGas, transactionBody, setGasPayer }
}
