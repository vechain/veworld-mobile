import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { useSelector } from "react-redux"
import { Transaction } from "thor-devkit"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { TransactionUtils } from "~Utils"
import { retrieveActivityFromTransactionSimulation } from "./useTransactionSimulation.functions"

export type Props = {
    clauses: Transaction.Body["clauses"]
    providedGasPayer?: string
    providedGas?: number
}

export const useTransactionSimulation = ({ clauses, providedGas, providedGasPayer }: Props) => {
    const selectedNetwork = useSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)

    const simulate = useCallback(async () => {
        const result = await TransactionUtils.simulateTransaction({
            url: selectedNetwork.currentUrl,
            clauses,
            providedGas: providedGas ?? 0,
            gasPayer: providedGasPayer ?? account.address,
            caller: account.address,
        })

        if (result.reverted) return

        return retrieveActivityFromTransactionSimulation(result.outputs, account.address)
    }, [account.address, clauses, providedGas, providedGasPayer, selectedNetwork.currentUrl])

    const { data, isFetching } = useQuery({
        queryKey: ["SimulateTransaction", clauses],
        queryFn: simulate,
        enabled: clauses.length > 0,
    })

    return { result: data, isLoading: isFetching }
}
