import { render, screen } from "@testing-library/react-native"
import React from "react"
import { VET } from "~Constants"
import { FungibleTokenTransferDetails } from "./FungibleTokenTransferDetails"

import { TestWrapper, TestHelpers } from "~Test"

const { mockFungibleTokenActivity, mockFungibleTokenActivityNoBlock } = TestHelpers.data

const mockPreloadedState = {
    tokens: {
        tokens: {
            mainnet: {
                custom: {},
                officialTokens: [],
                suggestedTokens: [],
            },
            testnet: {
                custom: {},
                officialTokens: [],
                suggestedTokens: [],
            },
            solo: {
                custom: {},
                officialTokens: [],
                suggestedTokens: [],
            },
            other: {
                custom: {},
                officialTokens: [],
                suggestedTokens: [],
            },
        },
    },
    currencies: {
        selected: "USD",
        availableCurrencies: [],
    },
}

describe("FungibleTokenTransferDetails", () => {
    describe("Transaction Details Conditional Rendering", () => {
        it("should show gas fee, transaction ID, and block number when activity has blockNumber", () => {
            render(
                <TestWrapper preloadedState={mockPreloadedState}>
                    <FungibleTokenTransferDetails
                        activity={mockFungibleTokenActivity}
                        token={VET}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Gas fee")).toBeTruthy()
            expect(screen.getByText("Transaction ID")).toBeTruthy()
            expect(screen.getByText("Block number")).toBeTruthy()
        })

        it("should not show gas fee, transaction ID, and block number when activity has no blockNumber", () => {
            render(
                <TestWrapper preloadedState={mockPreloadedState}>
                    <FungibleTokenTransferDetails
                        activity={mockFungibleTokenActivityNoBlock}
                        token={VET}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.queryByText("Gas fee")).toBeNull()
            expect(screen.queryByText("Transaction ID")).toBeNull()
            expect(screen.queryByText("Block number")).toBeNull()
        })

        it("should always show value and network fields regardless of blockNumber", () => {
            render(
                <TestWrapper preloadedState={mockPreloadedState}>
                    <FungibleTokenTransferDetails
                        activity={mockFungibleTokenActivityNoBlock}
                        token={VET}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Value")).toBeTruthy()
            expect(screen.getByText("Network")).toBeTruthy()
        })
    })
})
