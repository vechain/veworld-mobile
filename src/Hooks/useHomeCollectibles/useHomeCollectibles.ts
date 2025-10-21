import { useQuery } from "@tanstack/react-query"
import { getNFTs } from "~Networking"
import { selectAllFavoriteNfts, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useHomeCollectibles = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const favoriteNfts = useAppSelector(selectAllFavoriteNfts)

    return useQuery({
        queryKey: ["COLLECTIBLES", "NFTS", network.genesis.id, account.address, 4, 0],
        queryFn: () => getNFTs(network.type, account.address, 4, 0),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        enabled: favoriteNfts.length < 4,
    })
}
