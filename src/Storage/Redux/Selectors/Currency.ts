import { createSelector } from "@reduxjs/toolkit"
import { TokenWithExchangeRate, VeChainToken } from "~Model"
import { RootState } from "../Types"
import { selectFungibleTokens } from "./TokenApi"

export const getCurrency = (state: RootState) => state.currency

export const getCurrencyExchangeRate = createSelector(
    [getCurrency, (_, symbol: VeChainToken) => symbol],
    (currency, symbol) => {
        return currency[symbol]
    },
)

export const selectTokenExchangeRates = createSelector(
    [selectFungibleTokens, getCurrency],
    (tokens, currency) => {
        let tokenExchangeRates: TokenWithExchangeRate[] = []

        for (let token of tokens) {
            let obj = {
                ...token,
                rate: currency[token.symbol as VeChainToken]?.rate,
                change: currency[token.symbol as VeChainToken]?.change,
            }

            tokenExchangeRates.push(obj)
        }

        return tokenExchangeRates
    },
)
