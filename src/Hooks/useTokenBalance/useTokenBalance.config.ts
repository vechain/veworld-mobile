import { queryOptions } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"
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
}) => ["TOKENS", "SINGLE", address.toLowerCase(), networkGenesisId, tokenAddress]

export const getUseTokenBalanceConfig = ({
    address,
    tokenAddress,
    network,
    thor,
}: {
    address: string
    tokenAddress: string
    network: Network
    thor: Connex.Thor | ThorClient
}) =>
    queryOptions({
        queryKey: buildUseTokenBalanceQueryKey({ address, networkGenesisId: network.genesis.id, tokenAddress }),
        queryFn: () =>
            BalanceUtils.getBalancesFromBlockchain([tokenAddress], address, network, thor).then(
                res =>
                    res[0] ?? {
                        balance: "0",
                        isHidden: false,
                        timeUpdated: new Date().toISOString(),
                        tokenAddress,
                    },
            ),
        staleTime: 10 * 60 * 1000,
    })
