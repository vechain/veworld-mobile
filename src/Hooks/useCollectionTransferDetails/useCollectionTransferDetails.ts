import { useQuery } from "@tanstack/react-query"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import { useIsIndexerNetwork } from "~Hooks/useIsIndexerNetwork"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useCollectionTransferDetails = ({ address }: { address: string }) => {
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const indexerClient = useIndexerClient(network)
    const isIndexerNetwork = useIsIndexerNetwork(network)
    return useQuery({
        queryKey: ["COLLECTIBLES", "TRANSFER", network.genesis.id, account.address, address],
        queryFn: () =>
            indexerClient.GET("/api/v1/nfts", {
                params: {
                    query: {
                        address: account.address,
                        contractAddress: address,
                        direction: "DESC",
                    },
                },
            }),
        enabled: isIndexerNetwork,
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    })
}
