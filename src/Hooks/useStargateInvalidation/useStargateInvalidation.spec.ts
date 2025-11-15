import { renderHook, act } from "@testing-library/react-hooks"
import { useStargateConfig } from "~Hooks/useStargateConfig"

import { useStargateInvalidation } from "./useStargateInvalidation"
import { TestWrapper } from "~Test"

// Mocks
const invalidateQueriesMock = jest.fn().mockResolvedValue(undefined)

jest.mock("@tanstack/react-query", () => {
    const actual = jest.requireActual("@tanstack/react-query")
    return {
        ...actual,
        useQueryClient: () => ({
            invalidateQueries: invalidateQueriesMock,
        }),
    }
})

jest.mock("~Hooks/useStargateConfig", () => ({
    useStargateConfig: jest.fn(),
}))

describe("useFetchingStargate", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should early return when no Stargate network config is available", async () => {
        ;(useStargateConfig as jest.Mock).mockReturnValue(undefined)

        const { result } = renderHook(() => useStargateInvalidation(), { wrapper: TestWrapper })

        await act(async () => {
            await result.current.invalidate([])
        })

        expect(invalidateQueriesMock).not.toHaveBeenCalled()
    })

    it("should early return when addresses array is empty", async () => {
        ;(useStargateConfig as jest.Mock).mockReturnValue({ NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xnode" })

        const { result } = renderHook(() => useStargateInvalidation(), { wrapper: TestWrapper })

        await act(async () => {
            await result.current.invalidate([])
        })

        expect(invalidateQueriesMock).not.toHaveBeenCalled()
    })

    it("should invalidate Stargate-related queries via predicate when config is available", async () => {
        // minimal shape; only presence matters for the hook
        ;(useStargateConfig as jest.Mock).mockReturnValue({ NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xnode" })

        const { result } = renderHook(() => useStargateInvalidation(), { wrapper: TestWrapper })

        await act(async () => {
            await result.current.invalidate(["0x0"])
        })

        // Should call invalidateQueries with predicate and refetchType: "all"
        expect(invalidateQueriesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                predicate: expect.any(Function),
            }),
        )

        // Should be called exactly once
        expect(invalidateQueriesMock).toHaveBeenCalledTimes(1)
    })
})
