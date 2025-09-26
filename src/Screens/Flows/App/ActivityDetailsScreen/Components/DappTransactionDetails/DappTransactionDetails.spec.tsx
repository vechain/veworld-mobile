import { render, screen } from "@testing-library/react-native"
import React from "react"
import { DappTransactionDetails } from "./DappTransactionDetails"

import { TestWrapper, TestHelpers } from "~Test"

const { mockDappTxActivity, mockDappTxActivityNoBlock } = TestHelpers.data

import { ActivityStatus } from "~Model"

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

describe("DappTransactionDetails", () => {
    describe("Status Display Logic", () => {
        it("should show 'Failed' when status is REVERTED and no blockNumber", () => {
            render(
                <TestWrapper preloadedState={mockPreloadedState}>
                    <DappTransactionDetails
                        activity={mockDappTxActivityNoBlock}
                        status={ActivityStatus.REVERTED}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Failed")).toBeTruthy()
        })

        it("should show 'Reverted' when status is REVERTED and has blockNumber", () => {
            render(
                <TestWrapper preloadedState={mockPreloadedState}>
                    <DappTransactionDetails
                        activity={mockDappTxActivity}
                        status={ActivityStatus.REVERTED}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Reverted")).toBeTruthy()
        })
    })

    describe("Transaction Details Conditional Rendering", () => {
        it("should show gas fee and transaction ID when activity has blockNumber", () => {
            render(
                <TestWrapper preloadedState={mockPreloadedState}>
                    <DappTransactionDetails
                        activity={mockDappTxActivity}
                        status={ActivityStatus.SUCCESS}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.getByText("Gas fee")).toBeTruthy()
            expect(screen.getByText("Transaction ID")).toBeTruthy()
            expect(screen.getByText("Block number")).toBeTruthy()
        })

        it("should not show gas fee and transaction ID when activity has no blockNumber", () => {
            render(
                <TestWrapper preloadedState={mockPreloadedState}>
                    <DappTransactionDetails
                        activity={mockDappTxActivityNoBlock}
                        status={ActivityStatus.SUCCESS}
                        paid="1000000000000000000"
                    />
                </TestWrapper>,
            )

            expect(screen.queryByText("Gas fee")).toBeNull()
            expect(screen.queryByText("Transaction ID")).toBeNull()
            expect(screen.queryByText("Block number")).toBeNull()
        })
    })
})
