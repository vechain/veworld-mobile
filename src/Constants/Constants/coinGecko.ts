import { VET, VTHO } from "./Token"

export const VET_COINGECKO_ID: string = "vechain"

export const VETHOR_COINGECKO_ID: string = "vethor-token"

export const getCoinGeckoIdBySymbol = {
    [VET.symbol]: VET_COINGECKO_ID,
    [VTHO.symbol]: VETHOR_COINGECKO_ID,
}

export const COINGECKO_URL = process.env.REACT_APP_COINGECKO_URL

export const COINGECKO_MARKET_CHART_ENDPOINT = (coin: string) =>
    `${COINGECKO_URL}/coins/${coin}/market_chart`

export const COINGECKO_SUPPORTED_CURRENCIES_ENDPOINT = `${COINGECKO_URL}/simple/supported_vs_currencies`

export const COINGECKO_TOKEN_ENDPOINT = (coin: string) =>
    `${COINGECKO_URL}/coins/${coin}?localization=true&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`

export const COINGECKO_LIST = `${COINGECKO_URL}/coins/list?include_platform=true`
