import React from "react"
import { TestWrapper, TestHelpers } from "~Test"
import { HomeScreen } from "./HomeScreen"
import { render, screen } from "@testing-library/react-native"
jest.mock("axios")
import axios from "axios"
import crypto from "react-native-quick-crypto"
;(axios.get as jest.Mock).mockImplementation(url => {
    // getBalancesHook
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

    // getNftsHook
    if (url.includes("nfts/contracts?owner")) {
        return {
            data: [
                "0x2a5c0083937fe7efa9c9c3f099d6e73efe2a6c35",
                "0xc8ebcecb1438b9a00ea1003c956c3e0b83aa0ec3",
                "0xe0ab6916048ee208154bd76f1343d84b726fa62a",
            ],
        }
    }

    if (url.includes("vechain.github.io/nft-registry")) {
        return {
            data: TestHelpers.data.nftRegistryItem,
        }
    }

    if (url.includes("nfts?address=")) {
        return {
            data: TestHelpers.data.nftItemsPerContract,
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
