import { renderHook } from "@testing-library/react-hooks"
import { MarketInfo, useFormattedMarketInfo } from "./useFormattedMarketInfo"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { TestWrapper } from "~Test"
import { CURRENCY } from "~Constants"

const marketInfo: MarketInfo = {
    circulatingSupply: 72714516834,
    marketCap: 1429387590,
    totalSupply: 85985041177,
    totalVolume: 34734564,
}

const results = {
    circulatingSupply: "72,714,516,834",
    marketCap: "1,429,387,590",
    totalSupply: "85,985,041,177",
    totalVolume: "34,734,564",
}

jest.mock("~Storage/Redux/Selectors", () => ({
    ...jest.requireActual("~Storage/Redux/Selectors"),
    selectCurrency: jest.fn(),
}))

describe("useFormattedMarketInfo", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("no marketInfo provided - renders correctly", async () => {
        ;(selectCurrency as unknown as jest.Mock).mockImplementation(() => CURRENCY.USD)
        const { result } = renderHook(() => useFormattedMarketInfo({}), {
            wrapper: TestWrapper,
        })

        expect(result.current).toEqual({
            circulatingSupply: null,
            marketCap: null,
            totalSupply: null,
            totalVolume: null,
        })
    })

    it("should display the correct circulatingSupply", async () => {
        ;(selectCurrency as unknown as jest.Mock).mockImplementation(() => CURRENCY.USD)

        const { result } = renderHook(() => useFormattedMarketInfo({ marketInfo }), {
            wrapper: TestWrapper,
        })

        expect(result.current.circulatingSupply).toBe(results.circulatingSupply)
    })

    it("should display the correct marketCap", async () => {
        ;(selectCurrency as unknown as jest.Mock).mockImplementation(() => CURRENCY.USD)

        const { result } = renderHook(() => useFormattedMarketInfo({ marketInfo }), {
            wrapper: TestWrapper,
        })

        expect(result.current.marketCap).toBe(results.marketCap)
    })

    it("should display the correct totalSupply", async () => {
        ;(selectCurrency as unknown as jest.Mock).mockImplementation(() => CURRENCY.USD)

        const { result } = renderHook(() => useFormattedMarketInfo({ marketInfo }), {
            wrapper: TestWrapper,
        })

        expect(result.current.totalSupply).toBe(results.totalSupply)
    })

    it("should display the correct totalVolume", async () => {
        ;(selectCurrency as unknown as jest.Mock).mockImplementation(() => CURRENCY.USD)

        const { result } = renderHook(() => useFormattedMarketInfo({ marketInfo }), {
            wrapper: TestWrapper,
        })

        expect(result.current.totalVolume).toBe(results.totalVolume)
    })
})
