import { FungibleToken } from "~Model"
import { isVechainToken, mergeTokens } from "./TokenUtils"
import { VET, VTHO } from "~Constants"

describe("mergeTokens", () => {
    it("mergeTokens should merge two token arrays and remove duplicates based on symbol and genesisId", () => {
        const a = [
            { symbol: "ETH", genesisId: "1" },
            { symbol: "BTC", genesisId: "2" },
            { symbol: "USDT", genesisId: "3" },
        ]

        const b = [
            { symbol: "BTC", genesisId: "2" },
            { symbol: "LINK", genesisId: "4" },
            { symbol: "ETH", genesisId: "1" },
        ]

        const expectedOutput = [
            { symbol: "USDT", genesisId: "3" },
            { symbol: "BTC", genesisId: "2" },
            { symbol: "LINK", genesisId: "4" },
            { symbol: "ETH", genesisId: "1" },
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
