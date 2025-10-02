import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useSortedTokensByFiatValue } from "./useSortedTokensByFiatValue"

jest.mock("~Hooks/useNonVechainTokensBalance", () => ({
    useNonVechainTokensBalance: jest.fn(),
}))

jest.mock("~Hooks/useNonVechainTokenFiat", () => ({
    useNonVechainTokenFiat: jest.fn(),
}))

jest.mock("~Hooks/useTokenWithCompleteInfo", () => ({
    useTokenWithCompleteInfo: jest.fn(),
}))

jest.mock("~Hooks/useTokenBalance", () => ({
    useMultipleTokensBalance: jest.fn(),
    useTokenBalance: jest.fn(),
}))

import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { useMultipleTokensBalance, useTokenBalance } from "~Hooks/useTokenBalance"

describe("useSortedTokensByFiatValue", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const mockTokenBalance = {
        balance: "1000000000000000000", // 1 token
        isHidden: false,
        timeUpdated: "123456789",
        tokenAddress: "0xtest",
    }

    const mockVetInfo = {
        fiatBalance: "$100.00",
        tokenInfoLoading: false,
    }

    const mockVthoInfo = {
        fiatBalance: "$50.00",
        tokenInfoLoading: false,
    }

    const mockB3trInfo = {
        fiatBalance: "$200.00",
        tokenInfoLoading: false,
        exchangeRate: 2.0,
    }

    const mockVot3Balance = {
        balance: "500000000000000000000", // 500 tokens
        isHidden: false,
        timeUpdated: "123456789",
        tokenAddress: "0xvot3",
    }

    it("should return correct interface structure", () => {
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [mockTokenBalance, mockTokenBalance, mockTokenBalance, mockTokenBalance],
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue(mockVetInfo)
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: mockVot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        expect(result.current).toHaveProperty("tokens")
        expect(result.current).toHaveProperty("isLoading")
        expect(Array.isArray(result.current.tokens)).toBe(true)
        expect(typeof result.current.isLoading).toBe("boolean")
    })

    it("should handle loading states correctly", () => {
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [],
            isLoading: true, // Loading
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
            ...mockVetInfo,
            tokenInfoLoading: false,
        })
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: mockVot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it("should handle empty vechainTokenBalances (early return)", () => {
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: null, // No data
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue(mockVetInfo)
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: mockVot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        // Should handle empty vechainTokenBalances gracefully
        expect(result.current.tokens).toEqual([])
        expect(result.current.isLoading).toBe(false)
    })

    it("should filter out hidden tokens", () => {
        const hiddenTokenBalance = { ...mockTokenBalance, isHidden: true }
        const visibleTokenBalance = { ...mockTokenBalance, isHidden: false }

        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [
                {
                    symbol: "VISIBLE",
                    address: "0xvisible",
                    balance: visibleTokenBalance,
                },
            ],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [visibleTokenBalance, hiddenTokenBalance, visibleTokenBalance, visibleTokenBalance],
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue(mockVetInfo)
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: mockVot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: ["$300.00"],
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        // Should filter out hidden tokens
        const hiddenTokens = result.current.tokens.filter(token => token.balance.isHidden)
        expect(hiddenTokens).toHaveLength(0)
    })

    it("should combine VBD tokens when both B3TR and VOT3 exist", () => {
        const b3trBalance = { ...mockTokenBalance, balance: "1000000000000000000" } // 1 B3TR
        const vot3Balance = { ...mockTokenBalance, balance: "2000000000000000000" } // 2 VOT3

        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [mockTokenBalance, mockTokenBalance, b3trBalance, vot3Balance], // VET, VTHO, B3TR, VOT3
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue(mockVetInfo)
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: vot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        // Should have VET, VTHO, and combined B3TR (not separate B3TR and VOT3)
        const tokenSymbols = result.current.tokens.map(token => token.symbol)
        expect(tokenSymbols).toContain("VET")
        expect(tokenSymbols).toContain("VTHO")
        expect(tokenSymbols).toContain("B3TR")
        expect(tokenSymbols).not.toContain("VOT3") // Should be combined into B3TR

        // Find the combined B3TR token
        const combinedB3TR = result.current.tokens.find(token => token.symbol === "B3TR")
        expect(combinedB3TR).toBeDefined()
        expect(combinedB3TR?.balance.balance).toBe("3000000000000000000") // 1 + 2 = 3 tokens
    })

    it("should handle VBD tokens with hidden status (hidden tokens filtered out before combination)", () => {
        const b3trBalance = { ...mockTokenBalance, isHidden: false }
        const vot3Balance = { ...mockTokenBalance, isHidden: true } // Hidden

        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [mockTokenBalance, mockTokenBalance, b3trBalance, vot3Balance],
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue(mockVetInfo)
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: vot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        // Hidden tokens are filtered out BEFORE VBD combination, so only visible B3TR remains
        const combinedB3TR = result.current.tokens.find(token => token.symbol === "B3TR")
        expect(combinedB3TR).toBeDefined()
        expect(combinedB3TR?.balance.isHidden).toBe(false) // Only visible B3TR remains after filtering

        // VOT3 should not exist because it was hidden and filtered out
        const vot3Token = result.current.tokens.find(token => token.symbol === "VOT3")
        expect(vot3Token).toBeUndefined()
    })

    it("should sort tokens by fiat value in descending order", () => {
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [
                {
                    symbol: "TOKEN1",
                    address: "0xtoken1",
                    balance: mockTokenBalance,
                },
            ],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [mockTokenBalance, mockTokenBalance, mockTokenBalance, mockTokenBalance],
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock)
            .mockReturnValueOnce({ fiatBalance: "$100.00", tokenInfoLoading: false, exchangeRate: 1.0 }) // VET
            .mockReturnValueOnce({ fiatBalance: "$50.00", tokenInfoLoading: false, exchangeRate: 0.5 }) // VTHO
            .mockReturnValueOnce({ fiatBalance: "$200.00", tokenInfoLoading: false, exchangeRate: 2.0 }) // B3TR
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: mockVot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: ["$300.00"], // TOKEN1
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        const tokenSymbols = result.current.tokens.map(token => token.symbol)
        // Should be sorted by fiat value: B3TR+VOT3 ($200 + $1000 = $1200) > TOKEN1 ($300) > VET ($100) > VTHO ($50)
        // Note: VOT3 has 500 tokens * $2.0 exchange rate = $1000, combined with B3TR $200 = $1200 total
        expect(tokenSymbols[0]).toBe("B3TR") // Combined B3TR+VOT3 fiat value
        expect(tokenSymbols[1]).toBe("TOKEN1")
        expect(tokenSymbols[2]).toBe("VET")
        expect(tokenSymbols[3]).toBe("VTHO")
    })

    it("should handle tokens with no fiat data (fallback to 0)", () => {
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [
                {
                    symbol: "UNKNOWN",
                    address: "0xunknown",
                    balance: mockTokenBalance,
                },
            ],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [mockTokenBalance, mockTokenBalance, mockTokenBalance, mockTokenBalance],
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
            fiatBalance: "$100.00",
            tokenInfoLoading: false,
            exchangeRate: 1.0,
        })
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: mockVot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [], // No fiat data for UNKNOWN token
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        // UNKNOWN token should be sorted last (fiat value = 0)
        const tokenSymbols = result.current.tokens.map(token => token.symbol)
        expect(tokenSymbols[tokenSymbols.length - 1]).toBe("UNKNOWN")
    })

    it("should use custom accountAddress when provided", () => {
        const customAddress = "0xcustom"

        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [mockTokenBalance, mockTokenBalance, mockTokenBalance, mockTokenBalance],
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue(mockVetInfo)
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: mockVot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        renderHook(() => useSortedTokensByFiatValue(customAddress), {
            wrapper: TestWrapper,
        })

        // Should call hooks with custom address
        expect(useNonVechainTokensBalance).toHaveBeenCalledWith({
            accountAddress: customAddress,
        })
        expect(useNonVechainTokenFiat).toHaveBeenCalledWith({
            accountAddress: customAddress,
        })
        expect(useTokenWithCompleteInfo).toHaveBeenCalledWith(expect.anything(), customAddress)
    })

    it("should handle all loading states in isLoading calculation", () => {
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [mockTokenBalance, mockTokenBalance, mockTokenBalance, mockTokenBalance],
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock)
            .mockReturnValueOnce({ ...mockVetInfo, tokenInfoLoading: true }) // VET loading
            .mockReturnValueOnce({ ...mockVthoInfo, tokenInfoLoading: false }) // VTHO not loading
            .mockReturnValueOnce({ ...mockB3trInfo, tokenInfoLoading: false }) // B3TR not loading
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: mockVot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        // Should be loading because vetInfo.tokenInfoLoading is true
        expect(result.current.isLoading).toBe(true)
    })

    it("should handle nonVechainTokensFiat loading state", () => {
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [mockTokenBalance, mockTokenBalance, mockTokenBalance, mockTokenBalance],
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
            ...mockVetInfo,
            tokenInfoLoading: false,
        })
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: mockVot3Balance,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [],
            isLoading: true, // Loading
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })

    it("should handle case when no VBD tokens exist", () => {
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue({
            data: [
                mockTokenBalance, // VET
                mockTokenBalance, // VTHO
                { ...mockTokenBalance, balance: "0" }, // B3TR with 0 balance
                { ...mockTokenBalance, balance: "0" }, // VOT3 with 0 balance
            ],
            isLoading: false,
        })
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue(mockVetInfo)
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: { ...mockVot3Balance, balance: "0" },
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useSortedTokensByFiatValue(), {
            wrapper: TestWrapper,
        })

        // Should have VET, VTHO, and combined B3TR (even with 0 balance)
        const tokenSymbols = result.current.tokens.map(token => token.symbol)
        expect(tokenSymbols).toContain("VET")
        expect(tokenSymbols).toContain("VTHO")
        expect(tokenSymbols).toContain("B3TR") // Combined B3TR should exist
        expect(tokenSymbols).not.toContain("VOT3") // VOT3 should be combined into B3TR
    })
})
