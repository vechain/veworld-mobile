import { ThorClient } from "@vechain/sdk-network"
import { queryClient } from "~Api/QueryProvider"
import { getNftNameAndSymbolOptions, getNftTotalSupplyOptions } from "./queries"

export const getNftCollectionMetadata = async (address: string, genesisId: string, thor: ThorClient) => {
    const [nameAndSymbol, totalSupply] = await Promise.allSettled([
        queryClient.fetchQuery(getNftNameAndSymbolOptions(address, genesisId, thor)),
        queryClient.fetchQuery(getNftTotalSupplyOptions(address, genesisId, thor)),
    ])

    if (nameAndSymbol.status === "rejected") {
        throw new Error("Failed to get NFT collection metadata")
    }

    return {
        name: nameAndSymbol.value.name,
        symbol: nameAndSymbol.value.symbol,
        totalSupply: totalSupply.status === "rejected" ? undefined : totalSupply.value.totalSupply?.toString(),
    }
}
