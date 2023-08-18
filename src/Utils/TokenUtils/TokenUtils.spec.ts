import { FungibleToken } from "~Model"
import { isVechainToken, mergeTokens } from "./TokenUtils"
import { VET, VTHO } from "~Constants"

describe("mergeTokens", () => {
    it("mergeTokens should merge two token arrays and remove duplicates based on address", () => {
        const a = [
            { symbol: "ETH", address: "0x1" },
            { symbol: "BTC", address: "0x2" },
            { symbol: "USDT", address: "0x3" },
        ]

        const b = [
            { symbol: "BTC", address: "2" },
            { symbol: "LINK", address: "4" },
            { symbol: "ETH", address: "1" },
        ]

        const expectedOutput = [
            { symbol: "ETH", address: "0x1" },
            { symbol: "BTC", address: "0x2" },
            { symbol: "USDT", address: "0x3" },
            { symbol: "LINK", address: "0x4" },
        ]

        const output = mergeTokens(a as FungibleToken[], b as FungibleToken[])

        expect(output).toEqual(expectedOutput)
    })
})

describe("isVechainToken", () => {
    it("should return correctly", () => {
        expect(isVechainToken(VET.symbol)).toBe(true)
        expect(isVechainToken(VTHO.symbol)).toBe(true)
        expect(isVechainToken("bar")).toBe(false)
    })
})
