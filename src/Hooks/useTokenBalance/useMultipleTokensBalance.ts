import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { useThor } from "~Components"
import { selectSelectedAccountAddress, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"
import { buildUseTokenBalanceQueryKey } from "./useTokenBalance.config"
import { Balance } from "~Model"

/**
 * Performs a batch request of balances. Prefer this hook over `useTokenBalance` if multiple token balances are needed at the same time.
 * @param addresses List of token addresses
 * @param accountAddress Account address. If not defined, fallbacks to the currently selected account
 * @returns the list of balances together with the loading state
 */
export const useMultipleTokensBalance = (addresses: string[], accountAddress?: string) => {
    const thor = useThor()
    const network = useAppSelector(selectSelectedNetwork)
    const sortedAddresses = useMemo(() => [...addresses].sort(), [addresses])
    const selectedAccountAddress = useAppSelector(selectSelectedAccountAddress)

    const address = useMemo(
        () => (accountAddress ?? selectedAccountAddress!).toLowerCase(),
        [accountAddress, selectedAccountAddress],
    )

    const qc = useQueryClient()

    const { data, dataUpdatedAt, isLoading } = useQuery({
        queryKey: ["TOKENS", "MULTIPLE", address, network.genesis.id, sortedAddresses],
        queryFn: () => BalanceUtils.getBalancesFromBlockchain(sortedAddresses, address, network, thor),
        staleTime: 10 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        if (!data) return
        //Update `useTokenBalance` query key. This query key will be used in multiple places, so it's better to to copy over the values from here
        data.forEach(value => {
            const queryKey = buildUseTokenBalanceQueryKey({
                address,
                networkGenesisId: network.genesis.id,
                tokenAddress: value.tokenAddress,
            })
            const cached = qc.getQueryState(queryKey)
            if (!cached || cached.dataUpdatedAt < dataUpdatedAt) {
                qc.setQueryData(queryKey, value, { updatedAt: dataUpdatedAt })
            }
        })
    }, [accountAddress, address, data, dataUpdatedAt, network.genesis.id, qc])

    /**
     * Return the query data from the `useTokenBalance` hook instead of from this hook
     */
    const mappedData = useMemo(() => {
        if (!data) return undefined
        return data.map(d => {
            const queryKey = buildUseTokenBalanceQueryKey({
                address,
                networkGenesisId: network.genesis.id,
                tokenAddress: d.tokenAddress,
            })
            const qData = qc.getQueryData<Balance>(queryKey)
            return qData ?? d
        })
    }, [address, data, network.genesis.id, qc])

    return useMemo(() => ({ isLoading, data: mappedData }), [isLoading, mappedData])
}
