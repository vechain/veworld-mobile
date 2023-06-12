import { error } from "~Utils"
import { CurrencyExchangeRate } from "~Model"
import { updateExchangeRate } from "~Storage/Redux/Slices"
import { getExchangeRate } from "./getExchangeRate"
import {
    AppThunkDispatch,
    RootState,
    TokenInfoResponse,
} from "~Storage/Redux/Types"
import { selectCurrency } from "~Storage/Redux/Selectors"
const allSettled = require("promise.allsettled")

/**
 * Fetches exchange rates for all vechain tokens gotten from coinGecko.
 */
export const fetchExchangeRates =
    ({ coinGeckoTokens }: { coinGeckoTokens: TokenInfoResponse[] }) =>
    async (dispatch: AppThunkDispatch, getState: () => RootState) => {
        try {
            const currency = selectCurrency(getState())

            const exchangePromises: Promise<CurrencyExchangeRate>[] = []
            for (const token of coinGeckoTokens) {
                exchangePromises.push(
                    getExchangeRate(currency, token.symbol, token.id),
                )
            }

            const exchangeResults = await allSettled(exchangePromises)

            const exchangeRates: CurrencyExchangeRate[] = exchangeResults.map(
                (result: PromiseSettledResult<TokenInfoResponse>) => {
                    if (result.status === "fulfilled") {
                        return result.value
                    }
                },
            )

            dispatch(updateExchangeRate(exchangeRates))
        } catch (e) {
            error(e)
        }
    }
