import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { useSmartMarketChart } from "~Api/Coingecko"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"
import { TokenCard } from "./TokenCard"

jest.mock("~Api/Coingecko", () => ({
    ...jest.requireActual("~Api/Coingecko"),
    useSmartMarketChart: jest.fn(),
}))

jest.mock("~Hooks/useTokenCardBalance", () => ({
    useTokenCardBalance: jest.fn(),
}))

jest.mock("react-native", () => ({
    ...jest.requireActual("react-native"),
    Dimensions: { get: jest.fn().mockReturnValue({ width: 400, height: 400 }) },
}))

describe("TokenCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render correctly", () => {
        ;(useSmartMarketChart as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            fiatBalance: "$0.00",
            showFiatBalance: true,
            tokenBalance: "0.00",
        })

        render(<TokenCard token={TestHelpers.data.VETWithBalance} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("TOKEN_CARD_NAME")).toHaveTextContent("VeChain")
    })

    it.each([
        { token: TestHelpers.data.VETWithBalance, name: "VeChain" },
        { token: TestHelpers.data.VTHOWithBalance, name: "VeThor" },
        { token: TestHelpers.data.VOT3WithBalance, name: "VeBetter" },
        { token: TestHelpers.data.B3TRWithBalance, name: "VeBetter" },
        { token: TestHelpers.data.VeDelegateWithBalance, name: "veDelegate" },
        {
            token: { ...TestHelpers.data.VeDelegateWithBalance, symbol: "TEST_SYMBOL", name: "TEST_NAME" },
            name: "TEST_NAME",
        },
    ])("should render $token.symbol as $name", ({ token, name }) => {
        ;(useSmartMarketChart as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            fiatBalance: "$0.00",
            showFiatBalance: true,
            tokenBalance: "0.00",
        })

        render(<TokenCard token={token} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("TOKEN_CARD_NAME")).toHaveTextContent(name)
    })

    it("should display the correct chart icon", () => {
        ;(useSmartMarketChart as jest.Mock).mockReturnValue({
            data: [
                { timestamp: Date.now(), value: 1 },
                { timestamp: Date.now() + 10000, value: 2 },
            ],
        })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            fiatBalance: "$0.00",
            showFiatBalance: true,
            tokenBalance: "0.00",
        })

        render(<TokenCard token={TestHelpers.data.VETWithBalance} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("TOKEN_CARD_CHART_ICON")).toBeVisible()
    })

    it("should display the correct balance (with fiat)", () => {
        ;(useSmartMarketChart as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            fiatBalance: "$1.00",
            showFiatBalance: true,
            tokenBalance: "2.00",
        })

        render(<TokenCard token={TestHelpers.data.VETWithBalance} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("TOKEN_CARD_FIAT_BALANCE")).toHaveTextContent("$1.00")
        expect(screen.getByTestId("TOKEN_CARD_TOKEN_BALANCE")).toHaveTextContent("2.00")
    })

    it("should display the correct balance (without fiat)", () => {
        ;(useSmartMarketChart as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            showFiatBalance: false,
            tokenBalance: "2.00",
        })

        render(<TokenCard token={TestHelpers.data.VETWithBalance} />, { wrapper: TestWrapper })

        expect(screen.queryByTestId("TOKEN_CARD_FIAT_BALANCE")).toBeNull()
        expect(screen.getByTestId("TOKEN_CARD_TOKEN_BALANCE")).toHaveTextContent("2.00")
    })

    it("should display the normal symbol for all tokens (except B3TR)", () => {
        ;(useSmartMarketChart as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            showFiatBalance: false,
            tokenBalance: "2.00",
        })

        render(<TokenCard token={TestHelpers.data.VETWithBalance} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("TOKEN_CARD_SYMBOL")).toHaveTextContent("VET")
    })

    it("should display custom symbol for B3TR", () => {
        ;(useSmartMarketChart as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            showFiatBalance: false,
            tokenBalance: "2.00",
        })

        render(<TokenCard token={TestHelpers.data.B3TRWithBalance} />, { wrapper: TestWrapper })

        expect(screen.queryByTestId("TOKEN_CARD_SYMBOL")).toBeNull()
        expect(screen.getByTestId("TOKEN_CARD_SYMBOL_1")).toHaveTextContent("B3TR")
        expect(screen.getByTestId("TOKEN_CARD_SYMBOL_2")).toHaveTextContent("VOT3")
    })
})
