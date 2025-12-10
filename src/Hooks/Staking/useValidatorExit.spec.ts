import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper, TestHelpers } from "~Test"
import { useValidatorExit } from "./useValidatorExit"

const { validatorExitEventMock, validatorExitEventsMock } = TestHelpers.data

const getHistory = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: any[]) => getHistory(...args),
    }),
}))

describe("useValidatorExit", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return empty data when no validator exit events", async () => {
        const { result, waitFor } = renderHook(() => useValidatorExit(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.data).toMatchObject({})
    })

    it("should return the validator exit events", async () => {
        ;(getHistory as jest.Mock).mockResolvedValue({
            data: {
                data: [validatorExitEventMock],
                pagination: {
                    hasNext: false,
                },
            },
        })
        const { result, waitFor } = renderHook(() => useValidatorExit(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.data).toMatchObject({
            "0x79bvalidator": [validatorExitEventMock],
        })
    })

    it("should return the validators exit events grouped by validator", async () => {
        ;(getHistory as jest.Mock).mockResolvedValue({
            data: {
                data: validatorExitEventsMock,
                pagination: {
                    hasNext: false,
                },
            },
        })
        const { result, waitFor } = renderHook(() => useValidatorExit(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.data).toMatchObject({
            "0x79bvalidator": [validatorExitEventsMock[0]],
            "0x79b68validator": [validatorExitEventsMock[1]],
        })
    })
})
