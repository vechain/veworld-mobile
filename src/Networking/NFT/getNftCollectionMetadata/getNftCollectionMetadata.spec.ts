import { ThorClient } from "@vechain/sdk-network"
import { getNftCollectionMetadata } from "./getNftCollectionMetadata"
import { queryClient } from "~Api/QueryProvider"

const getNftNameAndSymbol = jest.fn()
const getTotalSupply = jest.fn()
jest.mock("./queries", () => ({
    getNftNameAndSymbolOptions: jest.fn().mockImplementation((...args) => ({
        ...jest.requireActual("./queries").getNftNameAndSymbolOptions(...args),
        queryFn: () => getNftNameAndSymbol(),
        gcTime: Infinity,
    })),
    getNftTotalSupplyOptions: jest.fn().mockImplementation((...args) => ({
        ...jest.requireActual("./queries").getNftTotalSupplyOptions(...args),
        queryFn: () => getTotalSupply(),
        gcTime: Infinity,
    })),
}))

describe("getNftCollectionMetadata", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })
    it("should return total supply if nothing fails", async () => {
        ;(getNftNameAndSymbol as jest.Mock).mockResolvedValue({ name: "TEST", symbol: "TEST_S" })
        ;(getTotalSupply as jest.Mock).mockResolvedValue({ totalSupply: 10n })

        const r = await getNftCollectionMetadata("0x0", "0x0", ThorClient.at("https://testnet.vechain.org"))

        expect(r.name).toBe("TEST")
        expect(r.symbol).toBe("TEST_S")
        expect(r.totalSupply).toBe("10")
    })
    it("should not return total supply if it fails", async () => {
        ;(getNftNameAndSymbol as jest.Mock).mockResolvedValue({ name: "TEST", symbol: "TEST_S" })
        ;(getTotalSupply as jest.Mock).mockRejectedValue(new Error("ERR"))

        const r = await getNftCollectionMetadata("0x0", "0x0", ThorClient.at("https://testnet.vechain.org"))

        expect(r.name).toBe("TEST")
        expect(r.symbol).toBe("TEST_S")
        expect(r.totalSupply).not.toBeDefined()
    })
    it("should reject when name and symbol fail", async () => {
        ;(getNftNameAndSymbol as jest.Mock).mockRejectedValue(new Error("TEST ERROR"))
        ;(getTotalSupply as jest.Mock).mockResolvedValue({ totalSupply: 10n })

        await expect(() =>
            getNftCollectionMetadata("0x0", "0x0", ThorClient.at("https://testnet.vechain.org")),
        ).rejects.toThrow("Failed to get NFT collection metadata")
    })
})
