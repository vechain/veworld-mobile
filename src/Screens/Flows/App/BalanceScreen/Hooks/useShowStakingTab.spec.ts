import { TestWrapper } from "~Test"
import { renderHook } from "@testing-library/react-hooks"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { useUserHasVetTransfer } from "./useUserHasVetTransfer"
import { useShowStakingTab } from "./useShowStakingTab"

jest.mock("~Hooks/useSmartWallet", () => ({
    useSmartWallet: jest.fn(),
}))

jest.mock("./useUserHasVetTransfer", () => ({
    useUserHasVetTransfer: jest.fn().mockResolvedValue({
        data: true,
        isLoading: false,
    }),
}))

describe("useShowStakingTab", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return true if the user has a vet transfer and is a smart wallet", async () => {
        ;(useSmartWallet as jest.Mock).mockImplementation(() => ({
            smartAccountAddress: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
            isAuthenticated: true,
            isInitialized: true,
            ownerAddress: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        }))
        ;(useUserHasVetTransfer as jest.Mock).mockImplementation(() => ({
            data: true,
            isLoading: false,
        }))
        const { result } = renderHook(() => useShowStakingTab(), {
            wrapper: TestWrapper,
        })

        await expect(result.current).toBe(true)
    })

    it("should return false if the user has not a vet transfer and is a smart wallet", async () => {
        ;(useSmartWallet as jest.Mock).mockReturnValue({
            smartAccountAddress: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
            isAuthenticated: false,
            isInitialized: true,
            ownerAddress: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        })
        ;(useUserHasVetTransfer as jest.Mock).mockImplementation(() => ({
            data: false,
            isLoading: false,
        }))

        const { result } = renderHook(() => useShowStakingTab(), {
            wrapper: TestWrapper,
        })

        await expect(result.current).toBe(false)
    })

    it("should return true if the user is not a smart wallet", async () => {
        ;(useSmartWallet as jest.Mock).mockImplementation(() => ({
            smartAccountAddress: "0x4444444444444444444444444444444444444444",
            isAuthenticated: false,
            isInitialized: true,
            ownerAddress: "0x4444444444444444444444444444444444444444",
        }))

        const { result } = renderHook(() => useShowStakingTab(), {
            wrapper: TestWrapper,
        })

        await expect(result.current).toBe(true)
    })
})
