import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useActiveProposalsWithoutVote } from "./useActiveProposalsWithoutVote"

const indexerGet = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useMainnetIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => indexerGet(...args).then((res: any) => ({ data: res })),
    }),
}))

describe("useActiveProposalsWithoutVote", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should only keep active proposals without vote events", async () => {
        ;(indexerGet as jest.Mock).mockImplementation((path: string) => {
            if (path === "/api/v2/b3tr/proposals/results") {
                return Promise.resolve({
                    data: [
                        {
                            proposalId: "1",
                            state: "Active",
                        },
                        {
                            proposalId: "2",
                            state: "Active",
                        },
                    ],
                    pagination: {
                        hasNext: false,
                    },
                })
            }

            return Promise.resolve({
                data: [
                    {
                        proposalId: "2",
                    },
                ],
                pagination: {
                    hasNext: false,
                },
            })
        })

        const { result, waitFor } = renderHook(() => useActiveProposalsWithoutVote(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
        })

        expect(result.current.data?.activeProposals).toHaveLength(2)
        expect(result.current.data?.activeProposalsWithoutVote).toEqual([
            {
                proposalId: "1",
                state: "Active",
            },
        ])
        expect(result.current.data?.hasUnvotedActiveProposals).toBe(true)
        expect(result.current.data?.hasVotedForAnyActiveProposal).toBe(true)
        expect(result.current.data?.hasVotedForAllActiveProposals).toBe(false)
    })

    it("should paginate through proposals and vote history", async () => {
        ;(indexerGet as jest.Mock).mockImplementation((path: string, options: any) => {
            if (path === "/api/v2/b3tr/proposals/results") {
                const page = options.params.query.page
                if (page === 0) {
                    return Promise.resolve({
                        data: [{ proposalId: "1", state: "Active" }],
                        pagination: { hasNext: true },
                    })
                }

                return Promise.resolve({
                    data: [{ proposalId: "2", state: "Active" }],
                    pagination: { hasNext: false },
                })
            }

            const page = options.params.query.page
            if (page === 0) {
                return Promise.resolve({
                    data: [{ proposalId: "1" }],
                    pagination: { hasNext: true },
                })
            }

            return Promise.resolve({
                data: [{ proposalId: "2" }],
                pagination: { hasNext: false },
            })
        })

        const { result, waitFor } = renderHook(() => useActiveProposalsWithoutVote(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
        })

        expect(result.current.data?.activeProposals).toHaveLength(2)
        expect(result.current.data?.activeProposalsWithoutVote).toHaveLength(0)
        expect(result.current.data?.hasVotedForAllActiveProposals).toBe(true)
        expect(indexerGet).toHaveBeenCalledWith("/api/v2/b3tr/proposals/results", {
            params: {
                query: {
                    page: 0,
                    size: 50,
                    direction: "DESC",
                    states: ["Active"],
                },
            },
        })
        expect(indexerGet).toHaveBeenCalledWith("/api/v2/b3tr/proposals/results", {
            params: {
                query: {
                    page: 1,
                    size: 50,
                    direction: "DESC",
                    states: ["Active"],
                },
            },
        })
    })
})
