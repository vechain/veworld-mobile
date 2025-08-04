import { useQuery } from "@tanstack/react-query"
import { ThorClient } from "@vechain/sdk-network"

export const getChainId = async (thor: ThorClient) => {
    const genesisBlock = await thor.blocks.getGenesisBlock()
    if (!genesisBlock) throw new Error("Genesis block not found")
    const chainId = genesisBlock.id

    return chainId
}
export const getChainIdQueryKey = () => ["VECHAIN_KIT_CHAIN_ID"]

/**
 *  Get the account balance for the given address
 * @param address  The address of the account to get the balance for
 * @returns  The account balance
 */
export const useGetChainId = (nodeUrl: string) => {
    const thor = ThorClient.at(nodeUrl)

    return useQuery({
        queryKey: getChainIdQueryKey(),
        queryFn: () => getChainId(thor),
        enabled: !!thor,
        refetchInterval: 10000,
    })
}
