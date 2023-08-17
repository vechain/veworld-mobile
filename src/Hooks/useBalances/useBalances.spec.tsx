import { renderHook } from "@testing-library/react-hooks"
import { useBalances } from "./useBalances"
import { TokenWithCompleteInfo } from "~Model"

const token: TokenWithCompleteInfo = {
    address: "",
    icon: "fake icon string",
    balance: {
        balance: "0x4210c6d8151be70000",
        timeUpdated: "2023-05-17T08:22:11.878Z",
        tokenAddress: "VET",
        isHidden: false,
    },
    change: -1.46,
    coinGeckoId: "vechain",
    custom: false,
    decimals: 18,
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
