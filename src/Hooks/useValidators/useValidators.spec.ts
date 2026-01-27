import { renderHook } from "@testing-library/react-hooks"
import { TestHelpers, TestWrapper } from "~Test"
import { useValidators } from "./useValidators"

const { mockedValidators } = TestHelpers.data

const getValidators = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: unknown[]) => getValidators(...args),
    }),
}))

describe("useValidators", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return the validators", async () => {
        getValidators.mockResolvedValue({
            data: {
                data: mockedValidators,
                pagination: {
                    hasNext: false,
                },
            },
        })

        const { result, waitFor } = renderHook(() => useValidators(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toBeDefined()
        expect(result.current.data?.length).toEqual(3)
        expect(result.current.data?.[0].validatorVetStaked).toEqual(67185283)
    })

    it("should return the error if the request fails", async () => {
        getValidators.mockRejectedValue(new Error("Failed to fetch validators"))

        const { result, waitFor } = renderHook(() => useValidators(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.error).toBeDefined()
        expect(result.current.error?.message).toEqual(
            "Failed to fetch Stargate validators: Error: Failed to fetch validators",
        )
    })
})
