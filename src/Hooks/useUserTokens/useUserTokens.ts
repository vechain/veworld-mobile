import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { VeDelegate } from "~Constants"
import { Network, NETWORK_TYPE } from "~Model"
import { fetchFungibleTokensContracts } from "~Networking"
import { selectSelectedAccountAddress, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

const queryFn = async ({ network, address }: { network: Network; address: string }) => {
    const tokenAddresses: string[] = []
    let page = 0
    while (true) {
        const result = await fetchFungibleTokensContracts(address, page, network, false)
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

export const getUseUserTokensConfig = ({ address, network }: { address: string; network: Network }) =>
    queryOptions({
        queryKey: ["TOKENS", "USER", address, network.genesis.id],
        queryFn: () => queryFn({ network, address }),
        staleTime: 10 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData,
    })

export const useUserTokens = ({ address }: { address?: string }) => {
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAddresses = useAppSelector(selectSelectedAccountAddress)
    const parsedAddress = useMemo(() => address ?? selectedAddresses!, [address, selectedAddresses])
    return useQuery(getUseUserTokensConfig({ address: parsedAddress, network }))
}
