import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { FungibleToken, TokenWithCompleteInfo } from "~Model"
import { VET, VTHO } from "~Constants"
import { HexUtils, LocaleUtils, TokenUtils } from "~Utils"
import { selectSelectedNetwork } from "./Network"
import { selectSelectedAccount } from "./Account"
import { selectAllExchangeRates } from "./Currency"
import { uniqBy } from "lodash"
import { compareSymbols } from "~Utils/TokenUtils/TokenUtils"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"

const selectTokenState = (state: RootState) => state.tokens

export const selectTokensForNetwork = createSelector(
    [selectTokenState, selectSelectedNetwork],
    (tokens, network) => tokens.tokens[network.type],
)

export const selectCustomTokens = createSelector(
    selectTokenState,
    selectSelectedNetwork,
    selectSelectedAccount,
    (state, network, account) => {
        const normAccountAddress = HexUtils.normalize(account.address)
        return state.tokens[network.type].custom[normAccountAddress] ?? []
    },
)

const DEFAULT_CHART_DATA = [
    { timestamp: 0, value: 1 },
    { timestamp: 1, value: 1 },
    { timestamp: 2, value: 1 },
    { timestamp: 3, value: 1 },
    { timestamp: 4, value: 1 },
    { timestamp: 5, value: 1 },
    { timestamp: 6, value: 1 },
    { timestamp: 7, value: 1 },
    { timestamp: 8, value: 1 },
    { timestamp: 9, value: 1 },
    { timestamp: 10, value: 1 },
    { timestamp: 11, value: 1 },
    { timestamp: 12, value: 1 },
]

export const selectDashboardChartData = createSelector(
    [(_, state) => selectTokenState(state), symbol => symbol],
    (tokens, symbol) =>
        tokens.dashboardChartData?.[symbol]?.map(el => ({
            timestamp: el[0],
            value: el[1],
        })) || DEFAULT_CHART_DATA,
)

export const selectAssetDetailChartData = createSelector(
    [(_, state) => selectTokenState(state), symbol => symbol],
    (tokens, symbol) =>
        tokens.assetDetailChartData?.[symbol]?.map(el => ({
            timestamp: el[0],
            value: el[1],
        })),
)

export const selectCoinGeckoTokens = createSelector(
    selectTokenState,
    state => state.coinGeckoTokens,
)

export const selectOfficialTokens = createSelector(
    selectTokensForNetwork,
    state =>
        TokenUtils.mergeTokens([{ ...VET }, { ...VTHO }], state.officialTokens),
)

export const selectAllTokens = createSelector(
    selectOfficialTokens,
    selectCustomTokens,
    (officialTokens, customTokens) => {
        return TokenUtils.mergeTokens(officialTokens, customTokens)
    },
)

/**
 * Returns the addresses of all tokens that have a balance
 */
export const selectSuggestedTokens = createSelector(
    selectTokensForNetwork,
    state => state.suggestedTokens,
)

/**
 * Get fungible tokens for the current network but remove default ones
 */
export const selectNonVechainFungibleTokens = createSelector(
    selectOfficialTokens,
    tokens =>
        tokens.filter(
            (token: FungibleToken) =>
                !compareAddresses(token.address, VET.address) &&
                !compareAddresses(token.address, VTHO.address),
        ),
)

export const selectMarketInfoFor = createSelector(
    [(_, state) => selectTokenState(state), symbol => symbol],
    (tokens, symbol) => {
        return tokens.coinMarketInfo[symbol.toLowerCase()]
    },
)

export const selectTokensWithInfo = createSelector(
    [selectCoinGeckoTokens, selectOfficialTokens, selectAllExchangeRates],
    (coinGeckoTokens, githubTokens, exchangeRates) => {
        const defaultLocale = LocaleUtils.getLocale()

        const tokens: TokenWithCompleteInfo[] = githubTokens.map(
            (token: FungibleToken) => {
                const foundToken = coinGeckoTokens.find(t =>
                    compareSymbols(t.symbol, token.symbol),
                )

                if (!foundToken) return token as TokenWithCompleteInfo

                const foundExchangeRate = exchangeRates.find(rate =>
                    compareSymbols(foundToken.symbol, rate?.symbol),
                )

                return {
                    ...token,
                    coinGeckoId: foundToken.id,
                    symbol: foundToken.symbol.toUpperCase() ?? token.symbol,
                    name: foundToken.name ?? token.name,
                    decimals:
                        foundToken.detail_platforms.vechain.decimal_place ??
                        token.decimals,
                    rate: foundExchangeRate?.rate ?? 0,
                    change: foundExchangeRate?.change ?? 0,
                    desc: foundToken.description[defaultLocale] ?? token.desc,
                    links: {
                        blockchain_site: foundToken.links.blockchain_site,
                        homepage: foundToken.links.homepage,
                    },
                }
            },
        )

        const sortedTokens = uniqBy(tokens, "address").sort(
            (a: TokenWithCompleteInfo, b: TokenWithCompleteInfo) => {
                // if both objects have a coinGeckoId property
                if (a.coinGeckoId && b.coinGeckoId) return 0

                // if only a has a coinGeckoId property
                if (a.coinGeckoId && !b.coinGeckoId) return -1

                // if only b has a coinGeckoId property
                if (!a.coinGeckoId && b.coinGeckoId) return 1

                // if neither object has a coinGeckoId property, sort by name
                return 0
            },
        )

        return sortedTokens
    },
)
