import { screen, within } from "@testing-library/react-native"
import React from "react"
import { defaultMainNetwork } from "~Constants"
import { ActivityStatus, ActivityType } from "~Model"
import { TestHelpers, TestWrapper } from "~Test"
import { PendingTransactions } from "./PendingTransactions"

describe("PendingTransactions", () => {
    it("should not render the component if there are no txs", () => {
        TestHelpers.render.renderComponentWithProps(<PendingTransactions />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    activities: {
                        activities: [
                            {
                                from: "0x0",
                                id: "0x",
                                isTransaction: true,
                                timestamp: Date.now(),
                                type: ActivityType.TRANSFER_FT,
                                status: ActivityStatus.SUCCESS,
                            },
                        ],
                    },
                },
            },
        })

        expect(screen.queryByTestId("PENDING_TRANSACTIONS_ROOT")).toBeNull()
    })

    it("should render component if there is a tx", () => {
        TestHelpers.render.renderComponentWithProps(<PendingTransactions />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    activities: {
                        activities: [
                            {
                                from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab1"],
                                id: "74288e9519f1e81a5decf266c2f226a0e9436b47",
                                txId: "0xea3122a317bb0c4349462558cbb2dcc038978075672749484f047f4b396763fc",
                                blockNumber: 21791678,
                                genesisId: defaultMainNetwork.genesis.id,
                                isTransaction: true,
                                type: ActivityType.TRANSFER_FT,
                                timestamp: 1748446000000,
                                gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
                                delegated: false,
                                status: ActivityStatus.PENDING,
                                amount: "15000000000000000000",
                                tokenAddress: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
                                direction: "+",
                            },
                        ],
                    },
                },
            },
        })

        expect(screen.getByTestId("PENDING_TRANSACTIONS_ROOT")).toBeVisible()
        expect(screen.getByTestId("FT-TRANSFER-74288e9519f1e81a5decf266c2f226a0e9436b47")).toBeVisible()
    })

    it("should sort txs", () => {
        TestHelpers.render.renderComponentWithProps(<PendingTransactions />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    activities: {
                        activities: [
                            {
                                from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab1"],
                                id: "74288e9519f1e81a5decf266c2f226a0e9436b471",
                                txId: "0xea3122a317bb0c4349462558cbb2dcc038978075672749484f047f4b396763fc",
                                blockNumber: 21791679,
                                genesisId: defaultMainNetwork.genesis.id,
                                isTransaction: true,
                                type: ActivityType.TRANSFER_FT,
                                timestamp: 1748446000000,
                                gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
                                delegated: false,
                                status: ActivityStatus.PENDING,
                                amount: "15000000000000000000",
                                tokenAddress: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
                                direction: "+",
                            },
                            {
                                from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab2"],
                                id: "74288e9519f1e81a5decf266c2f226a0e9436b47",
                                txId: "0xea3122a317bb0c4349462558cbb2dcc038978075672749484f047f4b396763fc",
                                blockNumber: 21791678,
                                genesisId: defaultMainNetwork.genesis.id,
                                isTransaction: true,
                                type: ActivityType.TRANSFER_FT,
                                timestamp: 1748446000000,
                                gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
                                delegated: false,
                                status: ActivityStatus.PENDING,
                                amount: "15000000000000000000",
                                tokenAddress: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
                                direction: "+",
                            },
                        ],
                    },
                },
            },
        })

        expect(screen.getByTestId("PENDING_TRANSACTIONS_ROOT")).toBeVisible()
        expect(
            within(screen.queryAllByTestId(/^FT-TRANSFER-/)[0]).getByTestId("TOKEN_TRANSFER_RECEIVER"),
        ).toHaveTextContent("0x0e7…ab1")
        expect(
            within(screen.queryAllByTestId(/^FT-TRANSFER-/)[1]).getByTestId("TOKEN_TRANSFER_RECEIVER"),
        ).toHaveTextContent("0x0e7…ab2")
    })
})
