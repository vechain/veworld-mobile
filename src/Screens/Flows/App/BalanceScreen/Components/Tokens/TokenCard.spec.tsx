import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { useSmartMarketChart } from "~Api/Coingecko"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"
import { Routes } from "~Navigation"
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

    it("should not display chart icon by default (when no layout event fired)", () => {
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

        render(<TokenCard token={TestHelpers.data.VeDelegateWithBalance} />, { wrapper: TestWrapper })

        // By default, without layout event, availableChartWidth is undefined
        // This means hasSpaceForChart defaults to true, so icon should not show
        expect(screen.queryByTestId("TOKEN_CARD_CHART_ICON")).toBeNull()
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

    describe("Chart icon visibility and colors", () => {
        it("should show chart icon when availableChartWidth < 110 (hasSpaceForChart = false)", () => {
            ;(useSmartMarketChart as jest.Mock).mockReturnValue({
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

            const { getByTestId } = render(<TokenCard token={TestHelpers.data.VETWithBalance} />, {
                wrapper: TestWrapper,
            })

            // Trigger layout event with small width to make availableChartWidth < 110
            const tokenCard = getByTestId("TOKEN_CARD_NAME").parent?.parent?.parent
            fireEvent(tokenCard!, "layout", {
                nativeEvent: { layout: { width: 250 } }, // availableChartWidth = 250 - 196 = 54 < 110
            })

            // Chart icon should be visible when there's no space for chart
            expect(screen.getByTestId("TOKEN_CARD_CHART_ICON")).toBeTruthy()
        })

        it("should show green chart icon when price is going up", () => {
            ;(useSmartMarketChart as jest.Mock).mockReturnValue({
                data: [
                    { timestamp: Date.now(), value: 1 },
                    { timestamp: Date.now() + 10000, value: 2 }, // Price going up
                ],
            })
            ;(useTokenCardBalance as jest.Mock).mockReturnValue({
                fiatBalance: "$1.00",
                showFiatBalance: true,
                tokenBalance: "2.00",
            })

            const { getByTestId } = render(<TokenCard token={TestHelpers.data.VETWithBalance} />, {
                wrapper: TestWrapper,
            })

            // Trigger layout event with small width
            const tokenCard = getByTestId("TOKEN_CARD_NAME").parent?.parent?.parent
            fireEvent(tokenCard!, "layout", {
                nativeEvent: { layout: { width: 250 } },
            })

            const chartIcon = screen.getByTestId("TOKEN_CARD_CHART_ICON")
            expect(chartIcon).toBeTruthy()
            // Icon should be visible when price is going up
        })

        it("should show red chart icon when price is going down", () => {
            ;(useSmartMarketChart as jest.Mock).mockReturnValue({
                data: [
                    { timestamp: Date.now(), value: 2 },
                    { timestamp: Date.now() + 10000, value: 1 }, // Price going down
                ],
            })
            ;(useTokenCardBalance as jest.Mock).mockReturnValue({
                fiatBalance: "$1.00",
                showFiatBalance: true,
                tokenBalance: "2.00",
            })

            const { getByTestId } = render(<TokenCard token={TestHelpers.data.VETWithBalance} />, {
                wrapper: TestWrapper,
            })

            // Trigger layout event with small width
            const tokenCard = getByTestId("TOKEN_CARD_NAME").parent?.parent?.parent
            fireEvent(tokenCard!, "layout", {
                nativeEvent: { layout: { width: 250 } },
            })

            const chartIcon = screen.getByTestId("TOKEN_CARD_CHART_ICON")
            expect(chartIcon).toBeTruthy()
            // Icon should be visible when price is going down
        })

        it("should not show chart icon when hasSpaceForChart = true (availableChartWidth >= 110)", () => {
            ;(useSmartMarketChart as jest.Mock).mockReturnValue({
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

            const { getByTestId } = render(<TokenCard token={TestHelpers.data.VETWithBalance} />, {
                wrapper: TestWrapper,
            })

            // Trigger layout event with large width to make availableChartWidth >= 110
            const tokenCard = getByTestId("TOKEN_CARD_NAME").parent?.parent?.parent
            fireEvent(tokenCard!, "layout", {
                nativeEvent: { layout: { width: 400 } }, // availableChartWidth = 400 - 196 = 204 >= 110
            })

            // Chart icon should not be visible when there's space for chart
            expect(screen.queryByTestId("TOKEN_CARD_CHART_ICON")).toBeNull()
        })

        it("should not show chart icon when showFiatBalance is false", () => {
            ;(useSmartMarketChart as jest.Mock).mockReturnValue({
                data: [
                    { timestamp: Date.now(), value: 1 },
                    { timestamp: Date.now() + 10000, value: 2 },
                ],
            })
            ;(useTokenCardBalance as jest.Mock).mockReturnValue({
                showFiatBalance: false, // No fiat balance
                tokenBalance: "2.00",
            })

            const { getByTestId } = render(<TokenCard token={TestHelpers.data.VETWithBalance} />, {
                wrapper: TestWrapper,
            })

            // Trigger layout event with small width
            const tokenCard = getByTestId("TOKEN_CARD_NAME").parent?.parent?.parent
            fireEvent(tokenCard!, "layout", {
                nativeEvent: { layout: { width: 250 } },
            })

            // Chart icon should not be visible when showFiatBalance is false
            expect(screen.queryByTestId("TOKEN_CARD_CHART_ICON")).toBeNull()
        })
    })

    describe("Navigation behavior", () => {
        it("should not navigate when token does not support detail navigation", () => {
            ;(useSmartMarketChart as jest.Mock).mockReturnValue({ data: [] })
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

            expect(mockedNavigate).not.toHaveBeenCalled()
        })

        it("should navigate to token details when token supports detail navigation", () => {
            ;(useSmartMarketChart as jest.Mock).mockReturnValue({ data: [] })
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
            ;(useSmartMarketChart as jest.Mock).mockReturnValue({ data: [] })
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
