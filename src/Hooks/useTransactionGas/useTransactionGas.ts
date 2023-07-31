import { useCallback, useEffect, useState } from "react"
import { Transaction } from "thor-devkit"

import { debug, error, GasUtils } from "~Utils"
import { useThor } from "~Components"
import { EstimateGasResult } from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

type UseTransactionReturnProps = {
    gas?: EstimateGasResult
    setGas: (gas: EstimateGasResult) => void
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
export const useTransactionGas = ({
    clauses,
    providedGas,
    providedGasPayer,
}: Props): UseTransactionReturnProps => {
    const [loadingGas, setLoadingGas] = useState<boolean>(true)
    const [gas, setGas] = useState<EstimateGasResult>()
    const account = useAppSelector(selectSelectedAccount)
    const [gasPayer, setGasPayer] = useState<string>(
        providedGasPayer ?? account.address,
    )
    const thorClient = useThor()

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

    return { gas, loadingGas, setGas, setGasPayer }
}
