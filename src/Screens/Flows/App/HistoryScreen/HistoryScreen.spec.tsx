import React from "react"
import { TestWrapper } from "~Test"
import { HistoryScreen } from "./HistoryScreen"
import { render, screen } from "@testing-library/react-native"

jest.mock("axios")
import axios from "axios"
;(axios.get as jest.Mock).mockImplementation(url => {
    if (url.includes("transactions/origin?address=")) {
        return {
            data: {
                TX_Mock,
            },
        }
    }
})

const findElement = async () =>
    await screen.findByTestId("History_Screen", {}, { timeout: 5000 })

const TX_Mock = [
    {
        id: "string",
        blockId: "string",
        blockNumber: "string",
        blockTimestamp: 123456789,
        size: 2,
        chainTag: 2,
        blockRef: "string",
        expiration: 2,
        clauses: [{ to: "string", value: "string", data: "string" }],
        gasPriceCoef: 2,
        gas: 2,
        dependsOn: "string",
        nonce: "string",
        gasUsed: 2,
        gasPayer: "string",
        paid: "string",
        reward: "string",
        reverted: true,
        origin: "string",
        outputs: [
            {
                contractAddress: "string",
                events: [{ address: "string", topics: [""], data: "string" }],
                transfers: [
                    {
                        sender: "string",
                        recipient: "string",
                        amount: "string",
                    },
                ],
            },
        ],
    },
]

describe("HistoryScreen", () => {
    it("should render correctly", async () => {
        render(<HistoryScreen />, {
            wrapper: TestWrapper,
        })

        screen.debug()

        await findElement()
    }, 10000)
})
