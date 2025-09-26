import { B3TR, VET, VTHO } from "~Constants/Constants"

export type MarketChartTimeFrame = {
    label: string
    value: number
    interval?: string
}

export const marketChartTimeframes: MarketChartTimeFrame[] = [
    { label: "1D", value: 1, interval: "hourly" },
    { label: "1W", value: 7, interval: "daily" },
    { label: "1M", value: 30, interval: "daily" },
    { label: "3M", value: 90, interval: "daily" },
    { label: "6M", value: 180, interval: "daily" },
]

// Vechain tokens
export const VET_COINGECKO_ID: string = "vechain"
export const VETHOR_COINGECKO_ID: string = "vethor-token"
export const B3TR_COINGECKO_ID: string = "vebetterdao"

// Cross chain tokens
export const BTC_COINGECKO_ID: string = "bitcoin"
export const ETH_COINGECKO_ID: string = "ethereum"
export const SOL_COINGECKO_ID: string = "solana"
export const USDC_COINGECKO_ID: string = "usd-coin"
export const USDT_COINGECKO_ID: string = "tether"
export const WAN_COINGECKO_ID: string = "wanchain"
export const XRP_COINGECKO_ID: string = "ripple"

export const getCoinGeckoIdBySymbol = {
    [VET.symbol]: VET_COINGECKO_ID,
    [VTHO.symbol]: VETHOR_COINGECKO_ID,
    [B3TR.symbol]: B3TR_COINGECKO_ID,
    BTC: BTC_COINGECKO_ID,
    ETH: ETH_COINGECKO_ID,
    SOL: SOL_COINGECKO_ID,
    USDC: USDC_COINGECKO_ID,
    USDT: USDT_COINGECKO_ID,
    WAN: WAN_COINGECKO_ID,
    XRP: XRP_COINGECKO_ID,
}

/**
 * Reverse map of `getCoinGeckoIdBySymbol`
 */
export const getSymbolByCoingeckoId = Object.fromEntries(
    Object.entries(getCoinGeckoIdBySymbol).map(([key, value]) => [value, key]),
)
