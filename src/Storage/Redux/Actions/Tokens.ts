import { Dispatch } from "@reduxjs/toolkit"
import axios from "axios"
import {
    COINGECKO_LIST,
    COINGECKO_MARKET_INFO_ENDPOINT,
    COINGECKO_TOKEN_ENDPOINT,
    EXCHANGE_CLIENT_AXIOS_OPTS,
    getCoinGeckoIdBySymbol,
    VET,
    VTHO,
} from "~Constants"
import { debug, error, TokenUtils } from "~Utils"
import { FungibleToken, Network } from "~Model"
import { selectCurrency } from "../Selectors"
import { addOfficialTokens, setCoinGeckoTokens, setCoinMarketInfo, setSuggestedTokens } from "../Slices"
import { AppThunkDispatch, MarketInfoResponse, RootState, TokenInfoResponse } from "../Types"
import { fetchOfficialTokensOwned, getTokensFromGithub } from "~Networking"

const allSettled = require("promise.allsettled")

type FetchTokensResponse = {
    id: string
    symbol: string
    name: string
    platforms: {
        vechain: string
    }
}

export const getTokenInfo = async (tokenId: string) => {
    const response = await axios.get<TokenInfoResponse>(COINGECKO_TOKEN_ENDPOINT(tokenId), {
        ...EXCHANGE_CLIENT_AXIOS_OPTS,
        params: {
            days: 1,
        },
    })
    return response.data
}

/**
 * Fetches all tokens from CoinGecko that are on the VeChain network
 * and dispatches the results to the store
 */
export const updateTokenPriceData = () => async (dispatch: AppThunkDispatch) => {
    try {
        const coinGeckoTokensResponse = await axios.get<FetchTokensResponse[]>(COINGECKO_LIST, {
            ...EXCHANGE_CLIENT_AXIOS_OPTS,
            params: {
                days: 1,
            },
        })

        const foundTokens = coinGeckoTokensResponse.data.filter(c => c.platforms.hasOwnProperty("vechain"))

        const tokenPromises: Promise<TokenInfoResponse>[] = []
        for (const token of foundTokens) {
            if (TokenUtils.isVechainToken(token.symbol)) tokenPromises.push(getTokenInfo(token.id))
        }

        const tokenResults = await allSettled(tokenPromises)

        const coinGeckoTokens: TokenInfoResponse[] = tokenResults.map(
            (result: PromiseSettledResult<TokenInfoResponse>) => {
                if (result.status === "fulfilled") {
                    return result.value
                }
            },
        )

        dispatch(setCoinGeckoTokens(coinGeckoTokens))
    } catch (e) {
        error("updateTokenPriceData", e)
    }
}

/**
 * Update official tokens from Github
 */
export const updateOfficialTokens = (network: Network) => async (dispatch: AppThunkDispatch) => {
    const tokens = await getTokensFromGithub({
        network,
    })
    dispatch(addOfficialTokens({ network: network.type, tokens }))
}

/**
 * Update suggested tokens
 * @param accountAddress
 * @param officialTokens
 * @param network
 */
export const updateSuggestedTokens =
    (accountAddress: string, officialTokens: FungibleToken[], network: Network) =>
    async (dispatch: AppThunkDispatch) => {
        try {
            const tokenAddresses = await fetchOfficialTokensOwned(accountAddress, network)

            const suggestedTokens = tokenAddresses.filter(
                tokenAddress => officialTokens.findIndex(t => t.address === tokenAddress) !== -1,
            )

            debug(`Found ${suggestedTokens.length} suggested tokens`)

            if (suggestedTokens.length === 0) return

            dispatch(
                setSuggestedTokens({
                    network: network.type,
                    tokens: suggestedTokens,
                }),
            )
        } catch (e) {
            error("updateSuggestedTokens", e)
        }
    }

export const fetchVechainMarketInfo = () => async (dispatch: Dispatch, getState: () => RootState) => {
    const currency = selectCurrency(getState())

    try {
        const pricesResponse = await axios.get<MarketInfoResponse[]>(
            COINGECKO_MARKET_INFO_ENDPOINT(
                [getCoinGeckoIdBySymbol[VET.symbol], getCoinGeckoIdBySymbol[VTHO.symbol]],
                currency,
            ),
            {
                ...EXCHANGE_CLIENT_AXIOS_OPTS,
            },
        )

        const marketInfo = pricesResponse.data
        dispatch(setCoinMarketInfo({ data: marketInfo }))
    } catch (e) {
        error("fetchVechainMarketInfo", e)
    }
}
