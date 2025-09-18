import { renderHook } from "@testing-library/react-hooks"
import { TestHelpers, TestWrapper } from "~Test"

import { useExchangeRate } from "~Api/Coingecko"
import { useTokenCardBalance } from "./useTokenCardBalance"
import { ethers } from "ethers"

jest.mock("~Api/Coingecko", () => ({
    ...jest.requireActual("~Api/Coingecko"),
    useExchangeRate: jest.fn(),
}))

describe("useTokenCardBalance", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it.each([
        { token: TestHelpers.data.VETWithBalance, expected: "vechain" },
        { token: TestHelpers.data.B3TRWithBalance, expected: "vebetterdao" },
        { token: TestHelpers.data.VeDelegateWithBalance, expected: "vebetterdao" },
        { token: { ...TestHelpers.data.VeDelegateWithBalance, symbol: "TEST" }, expected: "TEST" },
    ])("should use the correct symbol for exchange rate of $token.symbol", ({ token, expected }) => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({ data: 1 })
        renderHook(() => useTokenCardBalance({ token }), { wrapper: TestWrapper })

        expect(useExchangeRate).toHaveBeenCalledWith({ vs_currency: "USD", id: expected })
    })

    it("should show covered balances", () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({ data: 1 })
        const { result } = renderHook(
            () =>
                useTokenCardBalance({
                    token: {
                        ...TestHelpers.data.VETWithBalance,
                        balance: { ...TestHelpers.data.VETWithBalance.balance, isHidden: true },
                    },
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current.fiatBalance).toBe("$••••••")
    })

    it("should show really low balances", () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({ data: 1 })
        const { result } = renderHook(
            () =>
                useTokenCardBalance({
                    token: {
                        ...TestHelpers.data.VETWithBalance,
                        balance: { ...TestHelpers.data.VETWithBalance.balance, balance: "1" },
                    },
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current.fiatBalance).toBe("< $0.01")
    })

    it("should show normal balances", () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({ data: 1 })
        const { result } = renderHook(
            () =>
                useTokenCardBalance({
                    token: {
                        ...TestHelpers.data.VETWithBalance,
                        balance: {
                            ...TestHelpers.data.VETWithBalance.balance,
                            balance: ethers.utils.parseEther("3.5").toString(),
                        },
                    },
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current.fiatBalance).toBe("$3.50")
    })

    it("should set showFiatBalance to false if no exchange rate is available", () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({ data: null })
        const { result } = renderHook(
            () =>
                useTokenCardBalance({
                    token: {
                        ...TestHelpers.data.VETWithBalance,
                        balance: { ...TestHelpers.data.VETWithBalance.balance, balance: "1" },
                    },
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current.showFiatBalance).toBe(false)
    })
})
