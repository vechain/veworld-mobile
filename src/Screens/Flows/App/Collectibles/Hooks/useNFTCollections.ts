import { useInfiniteQuery } from "@tanstack/react-query"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getNFTCollectionsQueryKey = (genesisId: string, address: string) => [
    "COLLECTIBLES",
    "COLLECTIONS",
    genesisId,
    address,
]

export const useNFTCollections = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const indexerClient = useIndexerClient(network)

    return useInfiniteQuery({
        queryKey: getNFTCollectionsQueryKey(network.genesis.id, selectedAccount.address),
        queryFn: ({ pageParam = 0 }) =>
            indexerClient
                .GET("/api/v1/nfts/contracts", {
                    params: {
                        query: {
                            owner: selectedAccount.address,
                            direction: "DESC",
                            page: pageParam,
                            size: NFT_PAGE_SIZE,
                        },
                    },
                })
                .then(res => res.data!),
        getNextPageParam: (lastPage, allPages) => (lastPage.pagination.hasNext ? allPages.length : undefined),
        initialPageParam: 0,
    })
}
