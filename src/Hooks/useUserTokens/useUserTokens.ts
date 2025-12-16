import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { VeDelegate } from "~Constants"
import { IndexerClient, useIndexerClient } from "~Hooks/useIndexerClient"
import { Network, NETWORK_TYPE } from "~Model"
import { DEFAULT_PAGE_SIZE } from "~Networking"
import { selectSelectedAccountAddress, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

const queryFn = async ({
    network,
    address,
    indexer,
}: {
    network: Network
    address: string
    indexer: IndexerClient
}) => {
    const tokenAddresses: string[] = []
    let page = 0
    while (true) {
        const result = await indexer
            .GET("/api/v1/transfers/fungible-tokens-contracts", {
                params: {
                    query: {
                        address,
                        direction: "DESC",
                        officialTokensOnly: false,
                        page,
                        size: DEFAULT_PAGE_SIZE,
                    },
                },
            })
            .then(res => res.data!)
        tokenAddresses.push(...result.data)
        if (!result.pagination.hasNext) break
        page++
    }

    if (
        network.type === NETWORK_TYPE.MAIN &&
        !tokenAddresses.find(token => AddressUtils.compareAddresses(token, VeDelegate.address))
    )
        tokenAddresses.push(VeDelegate.address)
    return tokenAddresses
}

export const getUseUserTokensConfig = ({
    address,
    indexer,
    network,
}: {
    address: string
    indexer: IndexerClient
    network: Network
}) =>
    queryOptions({
        queryKey: ["TOKENS", "USER", address, network.genesis.id],
        queryFn: () => queryFn({ network, address, indexer }),
        staleTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData,
    })

export const useUserTokens = ({ address }: { address?: string }) => {
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAddresses = useAppSelector(selectSelectedAccountAddress)
    const parsedAddress = useMemo(() => address ?? selectedAddresses!, [address, selectedAddresses])
    const indexer = useIndexerClient(network)
    return useQuery(getUseUserTokensConfig({ address: parsedAddress, network, indexer }))
}
