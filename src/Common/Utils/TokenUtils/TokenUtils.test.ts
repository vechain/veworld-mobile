import { FungibleToken } from "~Model"
import { mergeTokens } from "./TokenUtils"

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
