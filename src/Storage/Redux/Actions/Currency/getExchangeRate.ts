import { CURRENCY, ERROR_EVENTS } from "~Constants"
import { error } from "~Utils"
import { CurrencyExchangeRate } from "~Model"
import FiatExchangeClients from "./fiat"

//ALWAYS put CoinGecko first
const exchangeProviders = [FiatExchangeClients.CoinGecko, FiatExchangeClients.CoinBase]

export const getExchangeRate = async (
    fiatSymbol: CURRENCY,
    symbol: string,
    coinGeckoId: string,
): Promise<CurrencyExchangeRate> => {
    for (const provider of exchangeProviders) {
        try {
            const exchange = await provider.getExchangeRate(fiatSymbol, symbol, coinGeckoId)

            return exchange
        } catch (e) {
            error(ERROR_EVENTS.TOKENS, e)
        }
    }
    throw new Error("Failed to get exchange rate from any provider")
}
