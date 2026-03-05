import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getCurrentAllocationsRoundId } from "~Hooks/VeBetterDao/useCurrentAllocationRoundId"
import { IndexerClient, useMainnetIndexerClient } from "~Hooks/useIndexerClient"
import { useMainnetThorClient } from "~Hooks/useThorClient"
import { ActivityEvent } from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

const PAGE_SIZE = 1

export const getUseHasVotedInCurrentRoundQueryKey = (accountAddress: string) =>
    ["VEBETTER", "HAS_VOTED_CURRENT_ROUND", accountAddress] as const

const hasVotedInRound = async (accountAddress: string, roundId: string, indexer: IndexerClient): Promise<boolean> => {
    const response = await indexer.GET("/api/v2/history/{account}", {
        params: {
            path: {
                account: accountAddress,
            },
            query: {
                page: 0,
                size: PAGE_SIZE,
                direction: "DESC",
                eventName: [ActivityEvent.B3TR_XALLOCATION_VOTE],
            },
        },
    })

    const latestVoteEvent = response.data?.data?.[0]
    return latestVoteEvent?.roundId === roundId
}

export const useHasVotedInCurrentRound = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const indexer = useMainnetIndexerClient()
    const thor = useMainnetThorClient()

    return useQuery({
        queryKey: getUseHasVotedInCurrentRoundQueryKey(selectedAccount.address),
        queryFn: async () => {
            const currentRoundId = await getCurrentAllocationsRoundId(thor)
            const hasVotedInCurrentRound = await hasVotedInRound(selectedAccount.address, currentRoundId, indexer)

            return {
                currentRoundId,
                hasVotedInCurrentRound,
            }
        },
        enabled: !!selectedAccount.address && !!thor,
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    })
}
