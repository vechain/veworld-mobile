import { useCallback, useEffect, useState } from "react"
import { Transaction } from "thor-devkit"

import { error, GasUtils } from "~Utils"
import { useThor } from "~Components/Providers/ConnexProvider"
import { EstimateGasResult } from "~Model"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { ERROR_EVENTS } from "~Constants"
import { useSelector } from "react-redux"

type UseTransactionReturnProps = {
    gas?: EstimateGasResult
    setGas: (gas: EstimateGasResult) => void
    loadingGas: boolean
    setGasPayer: (gasPayer: string) => void
    calculateGasFees: (_clauses: Transaction.Body["clauses"]) => Promise<EstimateGasResult>
}

type Props = {
    clauses: Transaction.Body["clauses"]
    providedGasPayer?: string
    dependsOn?: string
    providedGas?: number
    disabled?: boolean
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
    disabled = false,
}: Props): UseTransactionReturnProps => {
    const [loadingGas, setLoadingGas] = useState<boolean>(true)
    const [gas, setGas] = useState<EstimateGasResult>()
    const selectedNetwork = useSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const [gasPayer, setGasPayer] = useState<string>(providedGasPayer ?? account.address)
    const thorClient = useThor()

    const calculateGasFees = useCallback(
        async (_clauses: Transaction.Body["clauses"]) => {
            return await GasUtils.estimateGas(
                selectedNetwork.urls[0],
                thorClient,
                _clauses,
                providedGas ?? 0,
                account.address,
                gasPayer,
            )
        },
        [account.address, gasPayer, providedGas, selectedNetwork.urls, thorClient],
    )

    const estimateGas = useCallback(async () => {
        setLoadingGas(true)
        try {
            const estimatedGas = await calculateGasFees(clauses)
            setGas(estimatedGas)
        } catch (e) {
            error(ERROR_EVENTS.SEND, e)
        } finally {
            setLoadingGas(false)
        }
    }, [calculateGasFees, clauses])

    useEffect(() => {
        if (!disabled) {
            estimateGas()
        }
    }, [disabled, estimateGas])

    return { gas, loadingGas, setGas, setGasPayer, calculateGasFees }
}
