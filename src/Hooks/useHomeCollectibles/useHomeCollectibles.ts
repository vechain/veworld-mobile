import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import {
    selectAllFavoriteNfts,
    selectBlackListedAddresses,
    selectReportedAddresses,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { HexUtils } from "~Utils"

export const useHomeCollectibles = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const favoriteNfts = useAppSelector(selectAllFavoriteNfts)
    const blackListedCollections = useAppSelector(selectBlackListedAddresses)
    const reportedCollections = useAppSelector(selectReportedAddresses)
    const indexerClient = useIndexerClient(network)

    const excludeCollections = useMemo(() => {
        const combined = [...blackListedCollections, ...reportedCollections]
        const uniqueAddresses = combined.reduce((acc, addr) => {
            const normalized = HexUtils.normalize(addr)
            if (!acc.find(existing => HexUtils.normalize(existing) === normalized)) {
                acc.push(addr)
            }
            return acc
        }, [] as string[])
        return uniqueAddresses.slice(0, 20)
    }, [blackListedCollections, reportedCollections])

    return useQuery({
        queryKey: ["COLLECTIBLES", "NFTS", network.genesis.id, account.address, 6, 0, excludeCollections],
        queryFn: () =>
            indexerClient
                .GET("/api/v1/nfts", {
                    params: {
                        query: {
                            address: account.address,
                            direction: "DESC",
                            page: 0,
                            size: 6,
                            ...(excludeCollections.length > 0 && { excludeCollections }),
                        },
                    },
                })
                .then(res => res.data!),
        staleTime: 5 * 60 * 1000,
        enabled: favoriteNfts.length < 6,
    })
}
