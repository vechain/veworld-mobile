import { renderHook } from "@testing-library/react-hooks"
import { useBalances } from "./useBalances"
import { Balance, FungibleToken } from "~Model"
import { TestWrapper } from "~Test"

const token: FungibleToken & { balance: Balance } = {
    address: "",
    icon: "fake icon string",
    balance: {
        balance: "0x4210c6d8151be70000",
        timeUpdated: "2023-05-17T08:22:11.878Z",
        tokenAddress: "VET",
        isHidden: false,
    },
    decimals: 18,
    custom: false,
    name: "VeChain",
    symbol: "VET",
}

const exchangeRate = 0.01946639767987759

describe("useMarketInfo", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return the correct fiatBalance", async () => {
        const { result } = renderHook(() => useBalances({ token, exchangeRate }), { wrapper: TestWrapper })
        expect(result.current.fiatBalance).toBe("23.72358205408073966746")
    })

    it("should return the correct tokenUnitBalance", async () => {
        const { result } = renderHook(() => useBalances({ token, exchangeRate }), { wrapper: TestWrapper })
        expect(result.current.tokenUnitBalance).toBe("1,218.69")
    })
})
