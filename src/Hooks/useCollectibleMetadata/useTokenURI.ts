import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useThorClient } from "~Hooks/useThorClient"
import { getTokenURI } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getTokenURIQueryKey = (genesisId: string, address: string, tokenId: string) => [
    "COLLECTIBLES",
    genesisId,
    address,
    tokenId,
]

export const useTokenURI = ({ address, tokenId }: { address: string; tokenId: string }) => {
    const thor = useThorClient()
    const network = useAppSelector(selectSelectedNetwork)
    const normalizedAddress = useMemo(() => address.toLowerCase(), [address])
    return useQuery({
        queryKey: getTokenURIQueryKey(network.genesis.id, normalizedAddress, tokenId),
        queryFn: () => getTokenURI(tokenId, address, thor),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })
}
