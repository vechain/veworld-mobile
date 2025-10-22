import { queryOptions } from "@tanstack/react-query"
import { VIP181_ABI } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { queryClient } from "~Api/QueryProvider"
import { getTokenURIQueryKey } from "~Hooks/useCollectibleMetadata/useTokenURI"

export const getTokenURI = async (tokenId: string, contractAddress: string, thor: ThorClient) => {
    const res = await thor.contracts.load(contractAddress, VIP181_ABI).read.tokenURI(tokenId)
    return res[0] as string
}

const getTokenURIOptions = (tokenId: string, contractAddress: string, genesisId: string, thor: ThorClient) => {
    return queryOptions({
        queryKey: getTokenURIQueryKey(genesisId, contractAddress, tokenId),
        queryFn: () => getTokenURI(tokenId, contractAddress, thor),
        staleTime: 1 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    })
}

export const getCachedTokenURI = async (
    tokenId: string,
    contractAddress: string,
    genesisId: string,
    thor: ThorClient,
) => {
    const res = await queryClient.fetchQuery(getTokenURIOptions(tokenId, contractAddress, genesisId, thor))
    return res
}
