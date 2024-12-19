import axios from "axios"
import { ERROR_EVENTS } from "~Constants"
import { error } from "~Utils"
import { z } from "zod"
import { queryClient } from "~Api/QueryProvider"
import { FeatureFlags } from "~Api/FeatureFlags"

const { marketsProxyFeature } = queryClient.getQueryData<FeatureFlags>(["Feature", "Flags"]) || {}

export const COINGECKO_URL =
    marketsProxyFeature && marketsProxyFeature.enabled ? marketsProxyFeature.url : marketsProxyFeature?.fallbackUrl

const timeout = Number(process.env.REACT_APP_EXCHANGE_CLIENT_AXIOS_TIMEOUT ?? "5000")

const axiosInstance = axios.create({
    timeout,
    baseURL: COINGECKO_URL,
})

const TokenInfoMarketDataSchema = z.object({
    total_supply: z.nullable(z.number()),
    max_supply: z.nullable(z.number()),
    circulating_supply: z.number(),
    last_updated: z.string(),
    price_change_percentage_24h: z.number(),
    current_price: z.record(z.string(), z.number()),
    market_cap: z.record(z.string(), z.number()),
    total_volume: z.record(z.string(), z.number()),
})

const TokenInfoResponseSchema = z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
    detail_platforms: z.object({
        vechain: z.object({
            decimal_place: z.nullable(z.number()),
            contract_address: z.string(),
        }),
    }),
    image: z.object({
        thumb: z.string(),
        small: z.string(),
        large: z.string(),
    }),
    description: z.record(z.string(), z.string()),
    links: z.object({
        blockchain_site: z.array(z.nullable(z.string())),
        homepage: z.array(z.string()),
    }),
    market_data: TokenInfoMarketDataSchema,
})

const VechainStatsTokenInfoResponse = z.record(
    z.string(),
    z.object({
        price_usd: z.nullable(z.string()),
        price_eur: z.nullable(z.string()),
        price_cny: z.nullable(z.string()),
        price_vet: z.nullable(z.string()),
        last_updated: z.nullable(z.number()),
    }),
)

export type TokenInfoMarketData = z.infer<typeof TokenInfoMarketDataSchema>
export type TokenInfoResponse = z.infer<typeof TokenInfoResponseSchema>
export type VechainStatsTokenInfoResponse = z.infer<typeof VechainStatsTokenInfoResponse>

/**
 *  Get the token info for a given coinGeckoId, including market data
 * @param coinGeckoId - The CoinGecko ID of the coin
 * @returns  the token info
 */
export const getTokenInfo = async (coinGeckoId?: string) => {
    try {
        // Just for better react-query support. We'll never reach this point if used via react-query hooks
        if (!coinGeckoId) throw new Error("CoinGecko ID is not defined")

        const response = await axiosInstance.get<TokenInfoResponse>(`/coins/${coinGeckoId}`, {
            params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false,
                sparkline: false,
            },
        })

        const zodParsed = TokenInfoResponseSchema.parse(response.data)

        return zodParsed
    } catch (e) {
        error(ERROR_EVENTS.TOKENS, e)
        throw e
    }
}

export const getVechainStatsTokensInfo = async () => {
    try {
        const response = await axiosInstance.get<VechainStatsTokenInfoResponse>("/price-list")

        const zodParsed = VechainStatsTokenInfoResponse.parse(response.data)
        return zodParsed
    } catch (e) {
        error(ERROR_EVENTS.TOKENS, e)
        throw e
    }
}

export type MarketChartResponse = {
    timestamp: number
    value: number
}[]

const MarketChartResponseSchema = z.object({
    prices: z.array(z.tuple([z.number(), z.number()])),
})

/**
 * Get the market chart of a coin for a given number of days and currency
 * @param coinGeckoId - The CoinGecko ID of the coin
 * @param vs_currency - The currency to compare
 * @param days - The number of days to get the market chart for
 * @returns  the market chart array of arrays of [timestamp, price]
 */
export const getMarketChart = async ({
    coinGeckoId,
    vs_currency,
    days,
    interval,
}: {
    coinGeckoId?: string
    vs_currency: string
    days: number
    interval?: string
}): Promise<MarketChartResponse> => {
    try {
        // Just for better react-query support. We'll never reach this point if used via react-query hooks
        if (!coinGeckoId) throw new Error("CoinGecko ID is not defined")

        interface PriceChangeResponse {
            prices: number[][]
        }

        const pricesResponse = await axiosInstance.get<PriceChangeResponse>(`/coins/${coinGeckoId}/market_chart`, {
            params: {
                days,
                vs_currency,
                interval,
            },
        })

        const zodParsed = MarketChartResponseSchema.parse(pricesResponse.data)

        return zodParsed.prices.map(entry => ({
            timestamp: entry[0],
            value: entry[1],
        }))
    } catch (e) {
        error(ERROR_EVENTS.TOKENS, e)
        throw e
    }
}

/**
 * Derive lower resolution market chart data from the highest resolution market chart data
 * This allows us to avoid making multiple requests for the same data, but works only for charts with a resolution > 1 day with daily interval
 * @param highestResolutionMarketChartData  the highest resolution market chart data
 * @param days  the number of days to get the market chart for (must be <= the number of days of the highest resolution market chart data)
 * @returns the market chart array of arrays of [timestamp, price]
 */
export const getSmartMarketChart = ({
    highestResolutionMarketChartData,
    days,
}: {
    highestResolutionMarketChartData?: MarketChartResponse
    days: number
}) => {
    if (!highestResolutionMarketChartData) throw new Error("No cached market chart data available")
    const startIndex = highestResolutionMarketChartData.findIndex(
        entry => entry.timestamp >= Date.now() - days * 24 * 60 * 60 * 1000,
    )
    return highestResolutionMarketChartData.slice(startIndex)
}
