import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { Routes } from "~Navigation"
import { TestHelpers, TestWrapper } from "~Test"

import { useSmartMarketChartV2 } from "~Api/Coingecko"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"

import { TokenCard } from "./TokenCard"

jest.mock("~Api/Coingecko", () => ({
    ...jest.requireActual("~Api/Coingecko"),
    useSmartMarketChartV2: jest.fn(),
}))

jest.mock("~Hooks/useTokenCardBalance", () => ({
    useTokenCardBalance: jest.fn(),
}))

jest.mock("react-native", () => ({
    ...jest.requireActual("react-native"),
    Dimensions: { get: jest.fn().mockReturnValue({ width: 400, height: 800 }) },
}))

jest.mock("d3-interpolate-path", () => {
    return {
        interpolatePath: jest.fn().mockImplementation(() => jest.fn()),
    }
})

const mockedNavigate = jest.fn()

jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native")
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
            goBack: jest.fn(),
            canGoBack: jest.fn(),
        }),
    }
})

jest.mock("~Hooks/useTokenWithCompleteInfo", () => ({
    useTokenWithCompleteInfo: jest.fn().mockImplementation((token: any) => {
        return {
            ...token,
        }
    }),
}))

describe("TokenCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render correctly", () => {
        ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({ data: [] })
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
        ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            fiatBalance: "$0.00",
            showFiatBalance: true,
            tokenBalance: "0.00",
        })

        render(<TokenCard token={token} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("TOKEN_CARD_NAME")).toHaveTextContent(name)
    })

    it("should not display chart icon on large screens (shouldShowCharts = true)", () => {
        ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({
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

        render(<TokenCard token={TestHelpers.data.VeDelegateWithBalance} />, { wrapper: TestWrapper })

        // On large screens (height > 667), shouldShowCharts is true
        // so chart is shown and icon should not be displayed
        expect(screen.queryByTestId("TOKEN_CARD_CHART_ICON")).toBeNull()
    })

    it("should display the correct balance (with fiat)", () => {
        ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({ data: [] })
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
        ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            showFiatBalance: false,
            tokenBalance: "2.00",
        })

        render(<TokenCard token={TestHelpers.data.VETWithBalance} />, { wrapper: TestWrapper })

        expect(screen.queryByTestId("TOKEN_CARD_FIAT_BALANCE")).toBeNull()
        expect(screen.getByTestId("TOKEN_CARD_TOKEN_BALANCE")).toHaveTextContent("2.00")
    })

    it("should display the normal symbol for all tokens (except B3TR)", () => {
        ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            showFiatBalance: false,
            tokenBalance: "2.00",
        })

        render(<TokenCard token={TestHelpers.data.VETWithBalance} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("TOKEN_CARD_SYMBOL")).toHaveTextContent("VET")
    })

    it("should display custom symbol for B3TR", () => {
        ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({ data: [] })
        ;(useTokenCardBalance as jest.Mock).mockReturnValue({
            showFiatBalance: false,
            tokenBalance: "2.00",
        })

        render(<TokenCard token={TestHelpers.data.B3TRWithBalance} />, { wrapper: TestWrapper })

        expect(screen.queryByTestId("TOKEN_CARD_SYMBOL")).toBeNull()
        expect(screen.getByTestId("TOKEN_CARD_SYMBOL_1")).toHaveTextContent("B3TR")
        expect(screen.getByTestId("TOKEN_CARD_SYMBOL_2")).toHaveTextContent("VOT3")
    })

    describe("Chart icon visibility and colors", () => {
        // With default mock (height 800, large screen), shouldShowCharts = true
        // Chart is rendered, not the icon

        it("should not show chart icon on large screens (shouldShowCharts = true)", () => {
            ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({
                data: [
                    { timestamp: Date.now(), value: 1 },
                    { timestamp: Date.now() + 10000, value: 2 },
                ],
            })
            ;(useTokenCardBalance as jest.Mock).mockReturnValue({
                fiatBalance: "$1.00",
                showFiatBalance: true,
                tokenBalance: "2.00",
            })

            render(<TokenCard token={TestHelpers.data.VETWithBalance} />, {
                wrapper: TestWrapper,
            })

            // On large screens (height > 667), shouldShowCharts is true, so chart is shown
            // and icon should not be visible
            expect(screen.queryByTestId("TOKEN_CARD_CHART_ICON")).toBeNull()
            // Chart should be rendered instead
            expect(screen.getByTestId("TOKEN_CARD_CHART")).toBeTruthy()
        })

        it("should not show chart icon when showFiatBalance is false", () => {
            ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({
                data: [
                    { timestamp: Date.now(), value: 1 },
                    { timestamp: Date.now() + 10000, value: 2 },
                ],
            })
            ;(useTokenCardBalance as jest.Mock).mockReturnValue({
                showFiatBalance: false, // No fiat balance
                tokenBalance: "2.00",
            })

            render(<TokenCard token={TestHelpers.data.VETWithBalance} />, {
                wrapper: TestWrapper,
            })

            // Chart icon should not be visible when showFiatBalance is false
            // (chartIcon memo returns null when showFiatBalance is false)
            expect(screen.queryByTestId("TOKEN_CARD_CHART_ICON")).toBeNull()
        })

        it("should not show chart icon when chart data is unavailable", () => {
            ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({
                data: null, // No price data
            })
            ;(useTokenCardBalance as jest.Mock).mockReturnValue({
                fiatBalance: "$1.00",
                showFiatBalance: true,
                tokenBalance: "2.00",
            })

            render(<TokenCard token={TestHelpers.data.VETWithBalance} />, {
                wrapper: TestWrapper,
            })

            // Icon should not be visible when there's no chart data
            // (chartIcon memo returns null when chartData is null)
            expect(screen.queryByTestId("TOKEN_CARD_CHART_ICON")).toBeNull()
        })
    })

    describe("Navigation behavior", () => {
        it("should navigate to send screenwhen token is not vechain token", () => {
            ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({ data: [] })
            ;(useTokenCardBalance as jest.Mock).mockReturnValue({
                fiatBalance: "$1.00",
                showFiatBalance: true,
                tokenBalance: "2.00",
            })

            // Use a custom token that doesn't support navigation (not VET, VTHO, or B3TR)
            const customToken = TestHelpers.data.token1WithBalance

            const { getByTestId } = render(<TokenCard token={customToken} />, { wrapper: TestWrapper })

            const tokenCard = getByTestId("TOKEN_CARD_NAME").parent?.parent?.parent?.parent
            fireEvent.press(tokenCard!)

            expect(mockedNavigate).toHaveBeenCalledWith(Routes.INSERT_ADDRESS_SEND, {
                token: expect.objectContaining({
                    symbol: "PLA",
                    address: "0x89827f7bb951fd8a56f8ef13c5bfee38522f2e1f",
                }),
            })
        })

        it("should navigate to token details when token supports detail navigation", () => {
            ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({ data: [] })
            ;(useTokenCardBalance as jest.Mock).mockReturnValue({
                fiatBalance: "$1.00",
                showFiatBalance: true,
                tokenBalance: "2.00",
            })

            const { getByTestId } = render(<TokenCard token={TestHelpers.data.VETWithBalance} />, {
                wrapper: TestWrapper,
            })

            const tokenCard = getByTestId("TOKEN_CARD_NAME").parent?.parent?.parent?.parent
            fireEvent.press(tokenCard!)

            expect(mockedNavigate).toHaveBeenCalledWith(Routes.TOKEN_DETAILS, {
                token: expect.objectContaining({
                    symbol: "VET",
                    address: "0x0",
                }),
            })
        })

        it.each([
            { token: TestHelpers.data.VETWithBalance, symbol: "VET" },
            { token: TestHelpers.data.VTHOWithBalance, symbol: "VTHO" },
            { token: TestHelpers.data.B3TRWithBalance, symbol: "B3TR" },
        ])("should support navigation for $symbol token", ({ token }) => {
            ;(useSmartMarketChartV2 as jest.Mock).mockReturnValue({ data: [] })
            ;(useTokenCardBalance as jest.Mock).mockReturnValue({
                fiatBalance: "$1.00",
                showFiatBalance: true,
                tokenBalance: "2.00",
            })

            const { getByTestId } = render(<TokenCard token={token} />, { wrapper: TestWrapper })

            const tokenCard = getByTestId("TOKEN_CARD_NAME").parent?.parent?.parent?.parent
            fireEvent.press(tokenCard!)

            expect(mockedNavigate).toHaveBeenCalledWith(Routes.TOKEN_DETAILS, {
                token: expect.objectContaining({
                    symbol: token.symbol,
                }),
            })
        })
    })
})
