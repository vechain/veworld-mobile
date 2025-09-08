import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { Network } from "~Model"
import { BalanceUtils } from "~Utils"

export const buildUseTokenBalanceQueryKey = ({
    address,
    networkGenesisId,
    tokenAddress,
}: {
    address: string
    networkGenesisId: string
    tokenAddress: string
}) => ["TOKENS", "BALANCE", address, networkGenesisId, tokenAddress]

export const useTokenBalanceConfig = ({
    address,
    tokenAddress,
    network,
    thor,
}: {
    address: string
    tokenAddress: string
    network: Network
    thor: Connex.Thor
}) =>
    queryOptions({
        queryKey: ["TOKEN_BALANCE", address, network.genesis.id, tokenAddress],
        queryFn: () =>
            BalanceUtils.getBalancesFromBlockchain([tokenAddress], address, network, thor).then(res => res[0]),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    })
