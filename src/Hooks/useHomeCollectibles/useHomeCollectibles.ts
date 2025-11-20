import { useQuery } from "@tanstack/react-query"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import { selectAllFavoriteNfts, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useHomeCollectibles = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const favoriteNfts = useAppSelector(selectAllFavoriteNfts)
    const indexerClient = useIndexerClient(network)

    return useQuery({
        queryKey: ["COLLECTIBLES", "NFTS", network.genesis.id, account.address, 6, 0],
        queryFn: () =>
            indexerClient.GET("/api/v1/nfts", {
                params: {
                    query: {
                        address: account.address,
                        direction: "DESC",
                        page: 0,
                        size: 6,
                    },
                },
            }),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        enabled: favoriteNfts.length < 6,
    })
}
