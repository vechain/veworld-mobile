import { useQuery } from "@tanstack/react-query"
import { getCollectionInfo } from "~Networking"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getNFTRegistryQueryKey = () => ["NFT", "REGISTRY"]

export const useNFTRegistry = () => {
    const network = useAppSelector(selectSelectedNetwork)

    return useQuery({
        queryKey: getNFTRegistryQueryKey(),
        queryFn: () => getCollectionInfo(network.type),
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        retry: 3,
    })
}
