import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { selectSelectedNetwork } from "./Network"
import { Balance, FungibleToken, TokenWithCompleteInfo } from "~Model"
import { selectAllExchangeRates } from "./Currency"
import { DEFAULT_VECHAIN_TOKENS, VET, VTHO } from "~Common"
import { LocaleUtils, TokenUtils } from "~Utils"
import { uniqBy } from "lodash"
import {
    selectVetTokenWithBalance,
    selectVthoTokenWithBalance,
} from "./Balances"

const selectTokenState = (state: RootState) => state.tokens

export const selectCustomTokens = createSelector(
    selectTokenState,
    selectSelectedNetwork,
    (tokens, network) =>
        tokens.custom.filter(
            (token: FungibleToken) => token.genesisId === network.genesis.id,
        ),
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
    selectTokenState,
    state => state.officialTokens,
)

export const selectSuggestedTokens = createSelector(
    selectTokenState,
    state => state.suggestedTokens,
)

export const selectAllFungibleTokens = createSelector(
    selectOfficialTokens,
    tokens => TokenUtils.mergeTokens(DEFAULT_VECHAIN_TOKENS, tokens),
)

/**
 * Get fungible tokens for the current network
 */
export const selectFungibleTokens = createSelector(
    selectAllFungibleTokens,
    selectSelectedNetwork,
    (tokens, network) =>
        tokens.filter(
            (token: FungibleToken) => token.genesisId === network.genesis.id,
        ),
)

/**
 * Get fungible tokens for the current network but remove default ones
 */
export const selectNonVechainFungibleTokens = createSelector(
    selectFungibleTokens,
    tokens =>
        tokens.filter(
            (token: FungibleToken) =>
                token.symbol !== VET.symbol && token.symbol !== VTHO.symbol,
        ),
)

export const selectTokensWithInfo = createSelector(
    [
        selectCoinGeckoTokens,
        selectFungibleTokens,
        selectAllExchangeRates,
        selectVetTokenWithBalance,
        selectVthoTokenWithBalance,
        selectSelectedNetwork,
    ],
    (
        coinGeckoTokens,
        githubTokens,
        exchangeRates,
        vetBalance,
        vthoBalance,
        network,
    ) => {
        const defaultLocale = LocaleUtils.getLocale()

        const tokens: TokenWithCompleteInfo[] = githubTokens.map(
            (token: FungibleToken) => {
                const foundToken = coinGeckoTokens.find(
                    t => t.symbol.toLowerCase() === token.symbol.toLowerCase(),
                )

                const foundExchangeRate = exchangeRates.find(
                    rate => foundToken?.id === rate?.coinGeckoId,
                )

                if (!foundToken) return token as TokenWithCompleteInfo

                let tokenBalance: Balance | undefined

                if (token.symbol.toUpperCase() === "VET")
                    tokenBalance = vetBalance?.balance

                if (token.symbol.toUpperCase() === "VTHO")
                    tokenBalance = vthoBalance?.balance

                return {
                    ...token,
                    coinGeckoId: foundToken.id,
                    symbol: foundToken.symbol.toUpperCase() ?? token.symbol,
                    name: foundToken.name ?? token.name,
                    decimals:
                        foundToken.detail_platforms.vechain.decimal_place ||
                        token.decimals,
                    address:
                        foundToken.detail_platforms.vechain.contract_address ??
                        token.address,
                    icon:
                        token.symbol.toUpperCase() === "VET" ||
                        token.symbol.toUpperCase() === "VTHO"
                            ? token.icon
                            : foundToken.image.large,
                    rate: foundExchangeRate?.rate || 0,
                    change: foundExchangeRate?.change || 0,
                    desc: foundToken.description[defaultLocale] ?? token.desc,
                    balance: tokenBalance,
                    links: {
                        blockchain_site: foundToken.links.blockchain_site,
                        homepage: foundToken.links.homepage,
                    },
                }
            },
        )

        const sortedTokens = uniqBy(tokens, "symbol")
            .filter(
                (token: TokenWithCompleteInfo) =>
                    token.genesisId === network.genesis.id,
            )
            .sort((a: TokenWithCompleteInfo, b: TokenWithCompleteInfo) => {
                // if both objects have a coinGeckoId property
                if (a.coinGeckoId && b.coinGeckoId) return 0

                // if only a has a coinGeckoId property
                if (a.coinGeckoId && !b.coinGeckoId) return -1

                // if only b has a coinGeckoId property
                if (!a.coinGeckoId && b.coinGeckoId) return 1

                // if neither object has a coinGeckoId property, sort by name
                return 0
            })

        return sortedTokens
    },
)

export const selectTokenWithInfoWithID = createSelector(
    [selectTokensWithInfo, (state: RootState, symbols: string[]) => symbols],
    (tokens, symbols) => {
        let foundTokens: TokenWithCompleteInfo[] = []

        symbols.forEach(symbol => {
            const foundToken = tokens.find(
                (token: TokenWithCompleteInfo) =>
                    token.symbol.toLowerCase() === symbol.toLowerCase(),
            )

            if (foundToken) foundTokens.push(foundToken)
        })

        return foundTokens || [VET, VTHO]
    },
)

export const selectMarketInfoFor = createSelector(
    [(_, state) => selectTokenState(state), symbol => symbol],
    (tokens, symbol) => {
        return tokens.coinMarketInfo[symbol.toLowerCase()]
    },
)
