import { useInfiniteQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { ActivityEvent, FungibleToken } from "~Model"
import { createActivityFromIndexedHistoryEvent, fetchIndexedHistoryEvent } from "~Networking"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const getUseAccountTokenActivitiesQueryKey = (
    networkGenesisId: string,
    accountAddress: string,
    tokenAddress: string,
) => ["TOKEN_ACTIVITIES", networkGenesisId, accountAddress, tokenAddress]

export const useAccountTokenActivities = (token: FungibleToken) => {
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)

    const fetchActivities = useCallback(
        async ({ pageParam }: { pageParam: number }) => {
            const pageSize = pageParam === 0 ? 6 : 4
            if (token.symbol === "VET")
                return fetchIndexedHistoryEvent(
                    account.address,
                    pageParam,
                    network,
                    [ActivityEvent.TRANSFER_VET, ActivityEvent.SWAP_FT_TO_VET, ActivityEvent.SWAP_VET_TO_FT],
                    { pageSize },
                )

            return fetchIndexedHistoryEvent(
                account.address,
                pageParam,
                network,
                [
                    ActivityEvent.TRANSFER_FT,
                    ActivityEvent.TRANSFER_SF,
                    ActivityEvent.SWAP_FT_TO_FT,
                    ActivityEvent.SWAP_FT_TO_VET,
                    ActivityEvent.SWAP_VET_TO_FT,
                ],
                { contractAddress: token.address, pageSize },
            )
        },
        [account.address, network, token.address, token.symbol],
    )

    return useInfiniteQuery({
        queryKey: getUseAccountTokenActivitiesQueryKey(network.genesis.id, account.address, token.address),
        queryFn: fetchActivities,
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            return lastPage.pagination.hasNext ? pages.length : undefined
        },
        gcTime: 5 * 60 * 1000,
        select(_data) {
            try {
                return {
                    data: _data.pages
                        .flatMap(t => t.data)
                        .map(v => createActivityFromIndexedHistoryEvent(v, account.address, network))
                        .filter((activity): activity is NonNullable<typeof activity> => activity !== null),
                    pagination: _data.pages[_data.pages.length - 1]?.pagination,
                }
            } catch (err) {
                return {
                    data: [],
                    pagination: {},
                }
            }
        },
        staleTime: 5 * 60 * 1000,
    })
}
