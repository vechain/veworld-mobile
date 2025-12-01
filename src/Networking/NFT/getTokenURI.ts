import { queryOptions } from "@tanstack/react-query"
import { VIP181_ABI } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { queryClient } from "~Api/QueryProvider"
import ThorUtils from "~Utils/ThorUtils"

/**
 * Get the token URI from address and token ID.
 * Provide blockNumber as a fallback if the tokenURI call fails
 * @param tokenId Token ID
 * @param contractAddress Contract address
 * @param thor Thor Client
 * @param blockNumber (Optional) indicate the fallback block number from where to try get value. (Useful for burnt tokens) --> The value will be decreased by 1
 * @returns The token URI of the token
 */
export const getTokenURI = async (tokenId: string, contractAddress: string, thor: ThorClient, blockNumber?: number) => {
    try {
        const r = await ThorUtils.clause
            .getMethod(VIP181_ABI, contractAddress, "tokenURI")
            .execute(thor, [BigInt(tokenId)])
        if (!r.success) {
            throw new Error("FAILED_TOKEN_URI")
        }
        return r.result.plain
    } catch (error) {
        if (error instanceof Error && error.message === "FAILED_TOKEN_URI" && blockNumber) {
            const r = await ThorUtils.clause
                .getMethod(VIP181_ABI, contractAddress, "tokenURI")
                .execute(thor, [BigInt(tokenId)], { revision: (blockNumber - 1).toString() })
            if (r.success) return r.result.plain
            throw new Error("FAILED_TOKEN_URI_READING")
        }
        throw error
    }
}

export const getTokenURIQueryKey = (genesisId: string, address: string | undefined, tokenId: string | undefined) => [
    "COLLECTIBLES",
    genesisId,
    address,
    tokenId,
]

const getTokenURIOptions = (tokenId: string, contractAddress: string, genesisId: string, thor: ThorClient) => {
    return queryOptions({
        queryKey: getTokenURIQueryKey(genesisId, contractAddress, tokenId),
        queryFn: () => getTokenURI(tokenId, contractAddress, thor),
        staleTime: 1 * 60 * 60 * 1000,
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
