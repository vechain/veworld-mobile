import { renderHook } from "@testing-library/react-hooks"
import { useBalances } from "./useBalances"
import { TokenWithCompleteInfo } from "~Model"

const token: TokenWithCompleteInfo = {
    address: "",
    icon: "fake icon string",
    balance: {
        accountAddress: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        balance: "0x4210c6d8151be70000",
        genesisId:
            "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        position: undefined,
        timeUpdated: "2023-05-17T08:22:11.878Z",
        tokenAddress: "VET",
    },
    change: -1.46,
    coinGeckoId: "vechain",
    custom: false,
    decimals: 18,
    genesisId:
        "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
    links: {
        blockchain_site: [
            "https://vechainstats.com/",
            "https://explore.vechain.org",
        ],
        homepage: ["https://www.vechain.org", "https://www.vechain.com"],
    },
    name: "VeChain",
    rate: 0.01946639767987759,
    symbol: "VET",
}

describe("useMarketInfo", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return the correct fiatBalance", async () => {
        const { result } = renderHook(() => useBalances({ token }))
        expect(result.current.fiatBalance).toBe("23.72")
    })

    it("should return the correct tokenUnitBalance", async () => {
        const { result } = renderHook(() => useBalances({ token }))
        expect(result.current.tokenUnitBalance).toBe("1,218.69")
    })
})
