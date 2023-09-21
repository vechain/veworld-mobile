import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { FungibleToken } from "~Model"
import { VET, VTHO } from "~Constants"

export const getCurrency = (state: RootState) => state.currencies

export const selectCurrencyExchangeRate = createSelector(
    [getCurrency, (_, token?: FungibleToken) => token],
    (currency, token) => {
        if (
            // if fake token is named VET don't get rates
            (token?.symbol.toLowerCase() === "vet" &&
                token.address !== VET.address) ||
            // if fake token is named VTHO don't get rates
            (token?.symbol.toLowerCase() === "vtho" &&
                token.address !== VTHO.address)
        )
            return

        return currency.exchangeRates?.find(
            rate => rate?.symbol?.toLowerCase() === token?.symbol.toLowerCase(),
        )
    },
)

export const selectAllExchangeRates = createSelector(
    getCurrency,
    state => state.exchangeRates,
)
