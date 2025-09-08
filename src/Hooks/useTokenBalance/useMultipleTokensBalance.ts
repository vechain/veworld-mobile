import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { useThor } from "~Components"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"
import { buildUseTokenBalanceQueryKey } from "./useTokenBalance.config"
import { Balance } from "~Model"

export const useMultipleTokensBalance = (addresses: string[], accountAddress: string) => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const sortedAddresses = useMemo(() => [...addresses].sort(), [addresses])

    const qc = useQueryClient()

    const { data, dataUpdatedAt } = useQuery({
        queryKey: ["TOKENS", "MULTIPLE", accountAddress, sortedAddresses],
        queryFn: () => BalanceUtils.getBalancesFromBlockchain(sortedAddresses, accountAddress, network, thor),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        if (!data) return
        data.forEach(value => {
            const queryKey = buildUseTokenBalanceQueryKey({
                address: accountAddress,
                networkGenesisId: network.genesis.id,
                tokenAddress: value.tokenAddress,
            })
            const cached = qc.getQueryState(queryKey)
            if (!cached || cached.dataUpdatedAt < dataUpdatedAt) {
                qc.setQueryData(queryKey, value, { updatedAt: dataUpdatedAt })
            }
        })
    }, [accountAddress, data, dataUpdatedAt, network.genesis.id, qc])

    return useMemo(() => {
        if (!data) return undefined
        return data.map(d => {
            const queryKey = buildUseTokenBalanceQueryKey({
                address: accountAddress,
                networkGenesisId: network.genesis.id,
                tokenAddress: d.tokenAddress,
            })
            const qData = qc.getQueryData<Balance>(queryKey)
            return qData ?? d
        })
    }, [accountAddress, data, network.genesis.id, qc])
}
