import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper, TestHelpers } from "~Test"

import { fetchStargateTokens } from "~Networking"
import { getTokenLevelName } from "~Utils/StargateUtils"

import { useUserNodes } from "./useUserNodes"

const { StargateNodeMocks } = TestHelpers.data

jest.mock("~Networking", () => ({
    ...jest.requireActual("~Networking"),
    fetchStargateTokens: jest.fn(),
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
        ;(fetchStargateTokens as jest.Mock).mockResolvedValue({
            data: StargateNodeMocks.map(node => ({
                tokenId: node.nodeId,
                level: getTokenLevelName(node.nodeLevel),
                owner: node.xNodeOwner,
                vetStaked: node.vetAmountStaked,
                totalBootstrapRewardsClaimed: "1",
                totalRewardsClaimed: "0",
            })),
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

    it("should handle error state", async () => {
        ;(fetchStargateTokens as jest.Mock).mockRejectedValue(new Error("Test error"))

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
