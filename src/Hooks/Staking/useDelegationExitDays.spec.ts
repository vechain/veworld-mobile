import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useDelegationExitDays } from "./useDelegationExitDays"

const getValidators = jest.fn()
const getBestBlockCompressed = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useIndexerClient: jest.fn().mockReturnValue({
        GET: (...args: unknown[]) => getValidators(...args),
    }),
}))

jest.mock("~Hooks/useThorClient", () => ({
    useThorClient: jest.fn().mockReturnValue({
        blocks: {
            getBestBlockCompressed: () => getBestBlockCompressed(),
        },
    }),
}))

const SECONDS_PER_BLOCK = 10
const SECONDS_PER_DAY = 86400

describe("useDelegationExitDays", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return undefined exitDays when validatorId is null", async () => {
        const { result, waitFor } = renderHook(() => useDelegationExitDays({ validatorId: null }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.exitDays).toBeUndefined()
    })

    it("should return undefined exitDays when disabled", async () => {
        const { result, waitFor } = renderHook(
            () => useDelegationExitDays({ validatorId: "0xvalidator", enabled: false }),
            { wrapper: TestWrapper },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.exitDays).toBeUndefined()
    })

    it("should calculate exitDays correctly when cycleEndBlock is in the future", async () => {
        const currentBlock = 1000000
        const cycleEndBlock = currentBlock + (SECONDS_PER_DAY / SECONDS_PER_BLOCK) * 5 // 5 days worth of blocks

        getValidators.mockResolvedValue({
            data: {
                data: [{ cycleEndBlock }],
            },
        })
        getBestBlockCompressed.mockResolvedValue({ number: currentBlock })

        const { result, waitFor } = renderHook(() => useDelegationExitDays({ validatorId: "0xvalidator" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.exitDays).toBe(5)
    })

    it("should return 0 when cycleEndBlock has passed", async () => {
        const currentBlock = 1000000
        const cycleEndBlock = currentBlock - 1000 // Already passed

        getValidators.mockResolvedValue({
            data: {
                data: [{ cycleEndBlock }],
            },
        })
        getBestBlockCompressed.mockResolvedValue({ number: currentBlock })

        const { result, waitFor } = renderHook(() => useDelegationExitDays({ validatorId: "0xvalidator" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.exitDays).toBe(0)
    })

    it("should return 0 when cycleEndBlock equals currentBlock", async () => {
        const currentBlock = 1000000

        getValidators.mockResolvedValue({
            data: {
                data: [{ cycleEndBlock: currentBlock }],
            },
        })
        getBestBlockCompressed.mockResolvedValue({ number: currentBlock })

        const { result, waitFor } = renderHook(() => useDelegationExitDays({ validatorId: "0xvalidator" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.exitDays).toBe(0)
    })

    it("should ceil the days calculation", async () => {
        const currentBlock = 1000000
        // 1.5 days worth of blocks should ceil to 2 days
        const blocksForOneAndHalfDays = Math.floor((SECONDS_PER_DAY / SECONDS_PER_BLOCK) * 1.5)
        const cycleEndBlock = currentBlock + blocksForOneAndHalfDays

        getValidators.mockResolvedValue({
            data: {
                data: [{ cycleEndBlock }],
            },
        })
        getBestBlockCompressed.mockResolvedValue({ number: currentBlock })

        const { result, waitFor } = renderHook(() => useDelegationExitDays({ validatorId: "0xvalidator" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.exitDays).toBe(2)
    })

    it("should return undefined when validator data is missing cycleEndBlock", async () => {
        getValidators.mockResolvedValue({
            data: {
                data: [{ validatorId: "0xvalidator" }], // No cycleEndBlock
            },
        })
        getBestBlockCompressed.mockResolvedValue({ number: 1000000 })

        const { result, waitFor } = renderHook(() => useDelegationExitDays({ validatorId: "0xvalidator" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.exitDays).toBeUndefined()
    })

    it("should return undefined when validator is not found", async () => {
        getValidators.mockResolvedValue({
            data: {
                data: [],
            },
        })
        getBestBlockCompressed.mockResolvedValue({ number: 1000000 })

        const { result, waitFor } = renderHook(() => useDelegationExitDays({ validatorId: "0xvalidator" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.exitDays).toBeUndefined()
    })

    it("should show loading state while fetching data", async () => {
        getValidators.mockImplementation(() => new Promise(() => {})) // Never resolves
        getBestBlockCompressed.mockImplementation(() => new Promise(() => {})) // Never resolves

        const { result } = renderHook(() => useDelegationExitDays({ validatorId: "0xvalidator" }), {
            wrapper: TestWrapper,
        })
        expect(result.current.isLoading).toBe(true)
        expect(result.current.exitDays).toBeUndefined()
    })
})
