import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper, TestHelpers } from "~Test"
import { useValidatorExit } from "./useValidatorExit"

const { validatorExitEventMock, validatorExitEventsMock } = TestHelpers.data

const delegationRequestEventMock = {
    id: "ae1162e95b2a27fdcb2b7ac5f51952e3cded7571",
    blockId: "0x01655a898c0676923877825c084adfa96a95929d2f775df0311f15f4683a7ac6",
    blockNumber: 23419529,
    blockTimestamp: 1764233710,
    txId: "0x930331ba96108300a46075854449056946f8c16c0d8b3a0e6fe61b8bf8c51b93",
    origin: validatorExitEventMock.owner,
    gasPayer: validatorExitEventMock.owner,
    tokenId: "15676",
    eventName: "STARGATE_DELEGATE_REQUEST",
    value: "10000000000000000000000",
    levelId: "8",
    owner: validatorExitEventMock.owner,
    validator: "0xae99cb89767a09d53e589a40cb4016974aba4b94",
    delegationId: "70",
}

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

    it("should return the validators that did not delegate again after exiting", async () => {
        ;(getHistory as jest.Mock).mockResolvedValue({
            data: {
                data: [delegationRequestEventMock, ...validatorExitEventsMock],
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
            "0x79b68validator": [validatorExitEventsMock[1]],
        })
    })
})
