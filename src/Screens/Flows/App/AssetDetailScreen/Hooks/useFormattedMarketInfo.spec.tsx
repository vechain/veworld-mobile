import { renderHook } from "@testing-library/react-hooks"
import { useFormattedMarketInfo } from "./useFormattedMarketInfo"
import { selectCurrency } from "~Storage/Redux/Selectors"
import { TestWrapper } from "~Test"
import { CURRENCY } from "~Common"

const marketInfo = {
    ath: 0.280991,
    ath_change_percentage: -92.99403,
    ath_date: "2021-04-19T01:08:21.675Z",
    atl: 0.00191713,
    atl_change_percentage: 926.853,
    atl_date: "2020-03-13T02:29:59.652Z",
    circulating_supply: 72714516834,
    current_price: 0.01968728,
    fully_diluted_valuation: 1704555968,
    high_24h: 0.01974563,
    id: "vechain",
    image: "https://assets.coingecko.com/coins/images/1167/large/VET_Token_Icon.png?1680067517",
    last_updated: "2023-05-17T09:42:38.697Z",
    low_24h: 0.01932595,
    market_cap: 1429387590,
    market_cap_change_24h: -3007905.060431242,
    market_cap_change_percentage_24h: -0.20999,
    market_cap_rank: 40,
    max_supply: 86712634466,
    name: "VeChain",
    price_change_24h: -0.000005388993313805,
    price_change_percentage_24h: -0.02737,
    roi: {
        currency: "eth",
        percentage: 281.36315105315964,
        times: 2.813631510531596,
    },
    symbol: "vet",
    total_supply: 85985041177,
    total_volume: 34734564,
}

const results = {
    circulatingSupply: "72,714,516,834 USD",
    marketCap: "1,429,387,590 USD",
    totalSupply: "85,985,041,177 USD",
    totalVolume: "34,734,564 USD",
}

jest.mock("~Storage/Redux/Selectors", () => ({
    ...jest.requireActual("~Storage/Redux/Selectors"),
    selectCurrency: jest.fn(),
}))

describe("useFormattedMarketInfo", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should display the correct circulatingSupply", async () => {
        ;(selectCurrency as unknown as jest.Mock).mockImplementation(
            () => CURRENCY.USD,
        )

        const { result, waitForNextUpdate } = renderHook(
            () => useFormattedMarketInfo(marketInfo),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate()

        expect(result.current.circulatingSupply).toBe(results.circulatingSupply)
    })

    it("should display the correct marketCap", async () => {
        ;(selectCurrency as unknown as jest.Mock).mockImplementation(
            () => CURRENCY.USD,
        )

        const { result, waitForNextUpdate } = renderHook(
            () => useFormattedMarketInfo(marketInfo),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate()

        expect(result.current.marketCap).toBe(results.marketCap)
    })

    it("should display the correct totalSupply", async () => {
        ;(selectCurrency as unknown as jest.Mock).mockImplementation(
            () => CURRENCY.USD,
        )

        const { result, waitForNextUpdate } = renderHook(
            () => useFormattedMarketInfo(marketInfo),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate()

        expect(result.current.totalSupply).toBe(results.totalSupply)
    })

    it("should display the correct totalVolume", async () => {
        ;(selectCurrency as unknown as jest.Mock).mockImplementation(
            () => CURRENCY.USD,
        )

        const { result, waitForNextUpdate } = renderHook(
            () => useFormattedMarketInfo(marketInfo),
            {
                wrapper: TestWrapper,
            },
        )

        await waitForNextUpdate()

        expect(result.current.totalVolume).toBe(results.totalVolume)
    })
})
