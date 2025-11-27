import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useThorClient } from "~Hooks/useThorClient"
import { getTokenURI, getTokenURIQueryKey } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

type Args = {
    address: string | undefined
    tokenId: string | undefined
    /**
     * Number of the block used to get the Token URI
     * Pass it only when the token is burnt and the token URI throws
     */
    blockNumber?: number
}

export const useTokenURI = ({ address, tokenId, blockNumber }: Args) => {
    const thor = useThorClient()
    const network = useAppSelector(selectSelectedNetwork)
    const normalizedAddress = useMemo(() => address?.toLowerCase(), [address])
    return useQuery({
        queryKey: getTokenURIQueryKey(network.genesis.id, normalizedAddress, tokenId),
        queryFn: () => getTokenURI(tokenId!, address!, thor, blockNumber),
        staleTime: 5 * 60 * 1000,
        enabled: !!address && tokenId !== undefined,
    })
}
