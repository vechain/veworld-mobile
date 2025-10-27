import { renderHook } from "@testing-library/react-hooks"
import { useUserHasVetTransfer } from "./useUserHasVetTransfer"
import { TestWrapper } from "~Test"
import { fetchIndexedHistoryEvent } from "~Networking"

jest.mock("~Networking", () => ({
    ...jest.requireActual("~Networking"),
    fetchIndexedHistoryEvent: jest.fn(),
}))

describe("useUserHasVetTransfer", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should return true if the user has a vet transfer", async () => {
        ;(fetchIndexedHistoryEvent as jest.Mock).mockResolvedValue({
            data: [
                {
                    id: "13410e5613de934d436bc60b3ff550bfbc8dd427",
                    blockId: "0x015cfdb5e7cd0bf276eb4c26915d439e8f6a5d8b7cb2d72b7a8449bdf434538c",
                    blockNumber: 22871477,
                    blockTimestamp: 1759245240,
                    txId: "0x61a5eef3b14d6ec722eeaa6c30910f83ca9f44765a7e16fceae8b9783e985566",
                    origin: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    gasPayer: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
                    eventName: "TRANSFER_VET",
                    to: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
                    from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    value: "33683602576160000",
                },
            ],
            pagination: {
                hasCount: false,
                countLimit: 0,
                hasNext: false,
            },
        })
        const { result, waitFor } = renderHook(() => useUserHasVetTransfer(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.data).toBe(true)
        })
    })

    it("should return false if the user has not a vet transfer", async () => {
        ;(fetchIndexedHistoryEvent as jest.Mock).mockResolvedValue({
            data: [],
            pagination: {
                hasNext: false,
            },
        })
        const { result, waitFor } = renderHook(() => useUserHasVetTransfer(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.data).toBe(false)
        })
    })
})
