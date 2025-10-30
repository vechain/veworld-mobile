import React from "react"
import { render, fireEvent, waitFor } from "@testing-library/react-native"
import { AssetStats } from "./AssetStats"
import { TestWrapper } from "~Test"
import { RootState } from "~Storage/Redux/Types"

// Mock dependencies
jest.mock("~Api/Coingecko", () => ({
    useTokenInfo: jest.fn(() => ({
        data: {
            market_data: {
                market_cap: { usd: 1500000000 },
                total_supply: 86000000000,
                total_volume: { usd: 50000000 },
                circulating_supply: 70000000000,
                high_24h: { usd: 0.045821 },
                low_24h: { usd: 0.042156 },
            },
        },
    })),
    getCoinGeckoIdBySymbol: { VET: "vechain" },
    marketChartTimeframes: [{ label: "1D", value: 1 }],
}))

jest.mock("expo-haptics", () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: { Light: "light" },
}))

const createWrapper = (preloadedState: Partial<RootState> = {}) => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestWrapper preloadedState={preloadedState}>{children}</TestWrapper>
    )
}

describe("AssetStats", () => {
    describe("Rendering", () => {
        it("should render stat values correctly", () => {
            const { getByTestId } = render(<AssetStats tokenSymbol="VET" />, {
                wrapper: createWrapper(),
            })

            expect(getByTestId("stat-market-cap-value")).toBeTruthy()
            expect(getByTestId("stat-total-supply-value")).toBeTruthy()
            expect(getByTestId("stat-24h-volume-value")).toBeTruthy()
            expect(getByTestId("stat-circulating-supply-value")).toBeTruthy()
            expect(getByTestId("stat-24h-range-value")).toBeTruthy()

            const rangeValue = getByTestId("stat-24h-range-value")
            expect(rangeValue.props.children).toContain("-")
        })
    })

    describe("Description Accordion", () => {
        const shortDescription = "Short text"
        const longDescription =
            "This is a very long description that will span multiple lines when rendered " +
            "and should trigger the accordion functionality to allow users to expand and collapse it"

        it("should not show accordion when description renders ≤3 lines", () => {
            const { queryByTestId, getByTestId } = render(
                <AssetStats tokenSymbol="VET" tokenDescription={shortDescription} />,
                { wrapper: createWrapper() },
            )

            const hiddenText = getByTestId("token-description-hidden")

            // Simulate onTextLayout with 2 lines
            fireEvent(hiddenText, "textLayout", {
                nativeEvent: {
                    lines: [{ width: 100 }, { width: 100 }],
                },
            })

            expect(queryByTestId("read-more-toggle")).toBeNull()
        })

        it("should show accordion toggle when description renders >3 lines", async () => {
            const { getByTestId, queryByTestId } = render(
                <AssetStats tokenSymbol="VET" tokenDescription={longDescription} />,
                {
                    wrapper: createWrapper(),
                },
            )

            // Initially no toggle
            expect(queryByTestId("read-more-toggle")).toBeNull()

            // Simulate onTextLayout with 5 lines on the hidden text element
            const hiddenText = getByTestId("token-description-hidden")
            fireEvent(hiddenText, "textLayout", {
                nativeEvent: {
                    lines: [{ width: 100 }, { width: 100 }, { width: 100 }, { width: 100 }, { width: 100 }],
                },
            })

            await waitFor(() => {
                expect(getByTestId("read-more-toggle")).toBeTruthy()
            })
        })

        it("should toggle accordion when pressed", async () => {
            const { getByTestId } = render(<AssetStats tokenSymbol="VET" tokenDescription={longDescription} />, {
                wrapper: createWrapper(),
            })

            const hiddenText = getByTestId("token-description-hidden")

            // Simulate onTextLayout with 5 lines to trigger accordion
            fireEvent(hiddenText, "textLayout", {
                nativeEvent: {
                    lines: [{ width: 100 }, { width: 100 }, { width: 100 }, { width: 100 }, { width: 100 }],
                },
            })

            await waitFor(() => {
                expect(getByTestId("read-more-toggle")).toBeTruthy()
            })

            const toggleButton = getByTestId("read-more-toggle")
            const description = getByTestId("token-description")

            expect(description.props.numberOfLines).toBe(3)

            fireEvent.press(toggleButton)

            await waitFor(() => {
                expect(description.props.numberOfLines).toBeUndefined()
            })

            fireEvent.press(toggleButton)

            await waitFor(() => {
                expect(description.props.numberOfLines).toBe(3)
            })
        })

        it("should not cause infinite re-renders when line count is stable", () => {
            const { getByTestId } = render(<AssetStats tokenSymbol="VET" tokenDescription={longDescription} />, {
                wrapper: createWrapper(),
            })

            const hiddenText = getByTestId("token-description-hidden")

            // Fire onTextLayout multiple times with same line count
            const layoutEvent = {
                nativeEvent: {
                    lines: [{ width: 100 }, { width: 100 }, { width: 100 }, { width: 100 }],
                },
            }

            fireEvent(hiddenText, "textLayout", layoutEvent)
            fireEvent(hiddenText, "textLayout", layoutEvent)
            fireEvent(hiddenText, "textLayout", layoutEvent)

            // Should not throw or cause issues - state guard prevents updates
            expect(getByTestId("token-description")).toBeTruthy()
        })

        it("should render About section when description exists", () => {
            const { getByTestId } = render(<AssetStats tokenSymbol="VET" tokenDescription={shortDescription} />, {
                wrapper: createWrapper(),
            })

            expect(getByTestId("token-description")).toBeTruthy()
        })

        it("should not render description when none provided", () => {
            const { queryByTestId } = render(<AssetStats tokenSymbol="VET" />, {
                wrapper: createWrapper(),
            })

            expect(queryByTestId("token-description")).toBeNull()
        })
    })
})
