import { useInfiniteQuery } from "@tanstack/react-query"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import { ActivityEvent } from "~Model"
import { DEFAULT_PAGE_SIZE } from "~Networking"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getUserHasVetTransferQueryKey = (address: string) => {
    return ["VET_TRANSFER", address]
}

export const useUserHasVetTransfer = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)
    const indexer = useIndexerClient(network)

    return useInfiniteQuery({
        queryKey: getUserHasVetTransferQueryKey(selectedAccount.address),
        queryFn: ({ pageParam = 0 }) =>
            indexer
                .GET("/api/v2/history/{account}", {
                    params: {
                        path: {
                            account: selectedAccount.address,
                        },
                        query: {
                            direction: "DESC",
                            page: pageParam,
                            size: DEFAULT_PAGE_SIZE,
                            eventName: [ActivityEvent.TRANSFER_VET],
                        },
                    },
                })
                .then(res => res.data!),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            return lastPage.pagination.hasNext ? pages.length : undefined
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        select: data => {
            if (!data) return false
            return data.pages.flatMap(page => page.data).length > 0
        },
    })
}
