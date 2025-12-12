import { renderHook } from "@testing-library/react-hooks"
import { useQuery } from "@tanstack/react-query"
import { TestWrapper } from "~Test"
import { useAppOverview } from "./useAppOverview"

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: jest.fn(),
}))

const mockAppOverviewResponse = {
    entity: "test-app",
    totalUniqueUserInteractions: 2500,
    actionsRewarded: 1250,
}

describe("useAppOverview", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return app overview data when successful", () => {
        ;(useQuery as jest.Mock).mockReturnValue({
            data: mockAppOverviewResponse,
            isLoading: false,
            error: null,
        })

        const { result } = renderHook(() => useAppOverview("test-app-id"), {
            wrapper: TestWrapper,
        })

        expect(result.current.data).toEqual(mockAppOverviewResponse)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it("should return loading state", () => {
        ;(useQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        })

        const { result } = renderHook(() => useAppOverview("test-app-id"), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it("should not fetch when appId is undefined", () => {
        ;(useQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        })

        renderHook(() => useAppOverview(undefined), {
            wrapper: TestWrapper,
        })

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        )
    })
})
