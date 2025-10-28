import { useInfiniteQuery } from "@tanstack/react-query"
import { isEmpty } from "lodash"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { Network } from "~Model"
import { getContractAddresses } from "~Networking"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getNFTCollectionsQueryKey = (genesisId: string, address: string) => [
    "COLLECTIBLES",
    "COLLECTIONS",
    genesisId,
    address,
]

export const getNFTCollections = async (
    page: number,
    address: string,
    network: Network,
    _resultsPerPage: number = NFT_PAGE_SIZE,
) => {
    const { data: contractsForNFTs, pagination } = await getContractAddresses(
        network.type,
        address,
        _resultsPerPage,
        page,
    )

    if (isEmpty(contractsForNFTs) && !pagination.hasNext)
        return {
            collections: [],
            pagination,
        }

    return {
        collections: contractsForNFTs,
        pagination,
    }
}

export const useNFTCollections = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)

    return useInfiniteQuery({
        queryKey: getNFTCollectionsQueryKey(network.genesis.id, selectedAccount.address),
        queryFn: ({ pageParam = 0 }) => getNFTCollections(pageParam, selectedAccount.address, network),
        getNextPageParam: (lastPage, allPages) => (lastPage?.pagination.hasNext ? allPages.length : undefined),
        initialPageParam: 0,
    })
}
