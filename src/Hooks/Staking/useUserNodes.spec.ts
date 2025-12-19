import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper, TestHelpers } from "~Test"
import { getTokenLevelName } from "~Utils/StargateUtils"

import { useUserNodes } from "./useUserNodes"

const { StargateNodeMocks } = TestHelpers.data

const getTokens = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => getTokens(...args),
    }),
}))

describe("useUserNodes", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return empty data array when address is undefined", () => {
        const { result } = renderHook(() => useUserNodes(undefined), {
            wrapper: TestWrapper,
        })

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it("should return data when address is provided", async () => {
        ;(getTokens as jest.Mock).mockResolvedValue({
            data: {
                data: StargateNodeMocks.map(node => ({
                    tokenId: node.nodeId,
                    level: getTokenLevelName(node.nodeLevel),
                    owner: node.xNodeOwner,
                    vetStaked: node.vetAmountStaked,
                    totalBootstrapRewardsClaimed: "1",
                    totalRewardsClaimed: "0",
                    delegationStatus: node.delegationStatus,
                    validatorId: node.validatorId,
                })),
                pagination: {
                    hasNext: false,
                },
            },
        })
        const address = "0x123456789"

        const { result, waitFor } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data.length).toBe(3)
            expect(result.current.data[0].nodeId).toBe("1")
            expect(result.current.data[1].nodeId).toBe("2")
            expect(result.current.data[2].nodeId).toBe("3")
        })
    })

    it("should return data (2 pages) when address is provided", async () => {
        ;(getTokens as jest.Mock)
            .mockResolvedValueOnce({
                data: {
                    data: StargateNodeMocks.map(node => ({
                        tokenId: node.nodeId,
                        level: getTokenLevelName(node.nodeLevel),
                        owner: node.xNodeOwner,
                        vetStaked: node.vetAmountStaked,
                        totalBootstrapRewardsClaimed: "1",
                        totalRewardsClaimed: "0",
                        delegationStatus: node.delegationStatus,
                        validatorId: node.validatorId,
                    })),
                    pagination: {
                        hasNext: true,
                    },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    data: [
                        {
                            tokenId: "7",
                            level: "Dawn",
                            owner: "0x123456789",
                            vetStaked: "1",
                            totalBootstrapRewardsClaimed: "1",
                            totalRewardsClaimed: "0",
                            delegationStatus: "NONE",
                            validatorId: null,
                        },
                    ],
                    pagination: {
                        hasNext: false,
                    },
                },
            })
        const address = "0x123456789"

        const { result, waitFor } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data.length).toBe(4)
            expect(result.current.data[0].nodeId).toBe("1")
            expect(result.current.data[1].nodeId).toBe("2")
            expect(result.current.data[2].nodeId).toBe("3")
            expect(result.current.data[3].nodeId).toBe("7")
        })

        expect(getTokens).toHaveBeenNthCalledWith(1, "/api/v1/stargate/tokens", {
            params: {
                query: {
                    manager: "0x123456789",
                    owner: "0x123456789",
                    page: 0,
                    size: 50,
                },
            },
        })
        expect(getTokens).toHaveBeenNthCalledWith(2, "/api/v1/stargate/tokens", {
            params: {
                query: {
                    manager: "0x123456789",
                    owner: "0x123456789",
                    page: 1,
                    size: 50,
                },
            },
        })
    })

    it("should handle error state", async () => {
        ;(getTokens as jest.Mock).mockRejectedValue(new Error("Test error"))

        const address = "0x123456789"
        const { result, waitFor } = renderHook(() => useUserNodes(address), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
            expect(result.current.error?.message).toMatch(/^Error fetching user nodes/)
            expect(result.current.data).toStrictEqual([])
        })
    })
})
