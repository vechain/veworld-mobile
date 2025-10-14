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
    circulatingSupply: "72.7B",
    marketCap: "$1.4B",
    totalSupply: "86B",
    totalVolume: "$34.7M",
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
            marketCap: "$0.00",
            totalSupply: null,
            totalVolume: "$0.00",
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
