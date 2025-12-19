import { renderHook } from "@testing-library/react-hooks"
import { TestHelpers, TestWrapper } from "~Test"
import { getTokenLevelName } from "~Utils/StargateUtils"
import { useNodesByTokenId } from "./useNodesByTokenId"

const { StargateNodeMock } = TestHelpers.data

const getTokens = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => getTokens(...args),
    }),
}))

describe("useNodesByTokenId", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return undefined data when token id is undefined", () => {
        const { result } = renderHook(() => useNodesByTokenId(""), {
            wrapper: TestWrapper,
        })

        expect(result.current.data).toEqual(undefined)
        expect(result.current.isLoading).toBe(false)
    })

    it("should return the node info", async () => {
        ;(getTokens as jest.Mock).mockResolvedValue({
            data: {
                data: [StargateNodeMock].map(node => ({
                    tokenId: node.nodeId,
                    level: getTokenLevelName(node.nodeLevel),
                    owner: node.xNodeOwner,
                    vetStaked: node.vetAmountStaked,
                    totalBootstrapRewardsClaimed: "0",
                    totalRewardsClaimed: "0",
                    delegationStatus: node.delegationStatus,
                    validatorId: node.validatorId,
                })),
                pagination: {
                    hasNext: false,
                },
            },
        })
        const { result, waitFor } = renderHook(() => useNodesByTokenId("1"), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.data).toMatchObject(StargateNodeMock)
    })
})
