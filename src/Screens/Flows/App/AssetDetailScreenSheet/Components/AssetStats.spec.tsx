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
        const shortDescription = "This is a short description"
        const longDescription =
            "This is a very long description that has more than twenty words in total to trigger " +
            "the accordion functionality and allow users to expand and collapse"

        it("should not show accordion for short descriptions (≤20 words)", () => {
            const { queryByTestId, getByText } = render(
                <AssetStats tokenSymbol="VET" tokenDescription={shortDescription} />,
                { wrapper: createWrapper() },
            )

            expect(getByText(shortDescription)).toBeTruthy()
            expect(queryByTestId("read-more-toggle")).toBeNull()
        })

        it("should show accordion toggle for long descriptions (>20 words)", () => {
            const { getByTestId } = render(<AssetStats tokenSymbol="VET" tokenDescription={longDescription} />, {
                wrapper: createWrapper(),
            })

            expect(getByTestId("read-more-toggle")).toBeTruthy()
            expect(getByTestId("token-description")).toBeTruthy()
        })

        it("should toggle accordion when pressed", async () => {
            const { getByTestId } = render(<AssetStats tokenSymbol="VET" tokenDescription={longDescription} />, {
                wrapper: createWrapper(),
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
