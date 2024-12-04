import { B3TR, VET, VTHO } from "~Constants"

export type MarketChartTimeFrame = {
    label: string
    value: number
    interval: string
}

export const marketChartTimeframes: MarketChartTimeFrame[] = [
    { label: "1D", value: 1, interval: "daily" },
    { label: "1W", value: 7, interval: "daily" },
    { label: "1M", value: 30, interval: "daily" },
    { label: "3M", value: 90, interval: "daily" },
    { label: "6M", value: 180, interval: "daily" },
]

export const VET_COINGECKO_ID: string = "vechain"

export const VETHOR_COINGECKO_ID: string = "vethor-token"

export const B3TR_COINGECKO_ID: string = "vebetterdao"

export const getCoinGeckoIdBySymbol = {
    [VET.symbol]: VET_COINGECKO_ID,
    [VTHO.symbol]: VETHOR_COINGECKO_ID,
    [B3TR.symbol]: B3TR_COINGECKO_ID,
}
