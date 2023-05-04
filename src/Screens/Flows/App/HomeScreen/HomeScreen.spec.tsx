import React from "react"
import { TestWrapper, TestHelpers } from "~Test"
import { HomeScreen } from "./HomeScreen"
import { render, screen } from "@testing-library/react-native"
jest.mock("axios")
import axios from "axios"
import crypto from "react-native-quick-crypto"
;(axios.get as jest.Mock).mockImplementation(url => {
    if (url.includes("market_chart")) {
        return {
            data: {
                prices: [
                    [0, 0],
                    [1, 1],
                ],
            },
        }
    }
    if (url.includes("mainnet.vechain.org/accounts")) {
        return {
            data: {
                balance: "0",
                energy: "0",
            },
        }
    }
    if (url.includes("exchange-rates?currency")) {
        return {
            rate: 0,
            change: 0,
        }
    }
    if (url.includes("vechain.github.io/token-registry")) {
        return {
            data: JSON.stringify(TestHelpers.data.tokensMock),
        }
    }
})
const findElement = async () =>
    await screen.findByText("VeWorld", {}, { timeout: 5000 })

describe("HomeScreen", () => {
    it("should render correctly", async () => {
        ;(crypto.createCipheriv as jest.Mock).mockImplementationOnce(() => ({
            update: (first: string) => first,
            final: () => "",
        }))
        render(<HomeScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
