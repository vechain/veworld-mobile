import { useInfiniteQuery } from "@tanstack/react-query"
import { ActivityEvent } from "~Model"
import { fetchIndexedHistoryEvent } from "~Networking"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getUserHasVetTransferQueryKey = (address: string) => {
    return ["VET_TRANSFER", address]
}

export const useUserHasVetTransfer = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const network = useAppSelector(selectSelectedNetwork)

    return useInfiniteQuery({
        queryKey: getUserHasVetTransferQueryKey(selectedAccount.address),
        queryFn: ({ pageParam = 0 }) =>
            fetchIndexedHistoryEvent(selectedAccount.address, pageParam, network, [ActivityEvent.TRANSFER_VET]),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            return lastPage.pagination.hasNext ? pages.length : undefined
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
        select: data => {
            if (!data) return false
            return data.pages.flatMap(page => page.data).length > 0
        },
    })
}
