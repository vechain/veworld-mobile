import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { components } from "~Generated/indexer/schema"
import { IndexerClient, useMainnetIndexerClient } from "~Hooks/useIndexerClient"
import { ActivityEvent } from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

const PAGE_SIZE = 50

type ProposalResult = components["schemas"]["ProposalResult"]

type UseActiveProposalsWithoutVoteResponse = {
    activeProposals: ProposalResult[]
    activeProposalsWithoutVote: ProposalResult[]
    hasUnvotedActiveProposals: boolean
    hasVotedForAnyActiveProposal: boolean
    hasVotedForAllActiveProposals: boolean
}

const getAllActiveProposals = async (indexer: IndexerClient): Promise<ProposalResult[]> => {
    const activeProposals: ProposalResult[] = []
    let page = 0
    let hasNext = true

    while (hasNext) {
        const response = await indexer.GET("/api/v2/b3tr/proposals/results", {
            params: {
                query: {
                    page,
                    size: PAGE_SIZE,
                    direction: "DESC",
                    states: ["Active"],
                },
            },
        })
        const pageData = response.data?.data ?? []
        const pageHasNext = response.data?.pagination?.hasNext ?? false

        activeProposals.push(...pageData.filter(proposal => proposal.state === "Active"))
        hasNext = pageHasNext && pageData.length > 0
        page += 1
    }

    return activeProposals
}

const getAllVotedProposalIds = async (accountAddress: string, indexer: IndexerClient): Promise<Set<string>> => {
    const votedProposalIds = new Set<string>()
    let page = 0
    let hasNext = true

    while (hasNext) {
        const response = await indexer.GET("/api/v2/history/{account}", {
            params: {
                path: {
                    account: accountAddress,
                },
                query: {
                    page,
                    size: PAGE_SIZE,
                    direction: "DESC",
                    eventName: [ActivityEvent.B3TR_PROPOSAL_VOTE],
                },
            },
        })
        const pageData = response.data?.data ?? []
        const pageHasNext = response.data?.pagination?.hasNext ?? false

        pageData.forEach(event => {
            if (event.proposalId) {
                votedProposalIds.add(event.proposalId)
            }
        })

        hasNext = pageHasNext && pageData.length > 0
        page += 1
    }

    return votedProposalIds
}

export const getActiveProposalsWithoutVoteQueryKey = (accountAddress: string) => [
    "VEBETTER",
    "ACTIVE_PROPOSALS_WITHOUT_VOTE",
    accountAddress,
]

export const useActiveProposalsWithoutVote = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const indexer = useMainnetIndexerClient()

    return useQuery<UseActiveProposalsWithoutVoteResponse>({
        queryKey: getActiveProposalsWithoutVoteQueryKey(selectedAccount.address),
        queryFn: async () => {
            const [activeProposals, votedProposalIds] = await Promise.all([
                getAllActiveProposals(indexer),
                getAllVotedProposalIds(selectedAccount.address, indexer),
            ])

            const activeProposalsWithoutVote = activeProposals.filter(
                proposal => !votedProposalIds.has(proposal.proposalId),
            )
            const hasUnvotedActiveProposals = activeProposalsWithoutVote.length > 0
            const hasVotedForAnyActiveProposal = activeProposals.some(proposal =>
                votedProposalIds.has(proposal.proposalId),
            )

            return {
                activeProposals,
                activeProposalsWithoutVote,
                hasUnvotedActiveProposals,
                hasVotedForAnyActiveProposal,
                hasVotedForAllActiveProposals: activeProposals.length > 0 && !hasUnvotedActiveProposals,
            }
        },
        enabled: Boolean(selectedAccount.address),
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    })
}
