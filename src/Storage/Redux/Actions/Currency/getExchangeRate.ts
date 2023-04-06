import { error } from "~Common"
import { VeChainToken, CurrencyExchangeRate } from "~Model"
import FiatExchangeClients from "./fiat"

//ALWAYS put CoinGecko first
const exchangeProviders = [
    FiatExchangeClients.CoinGecko,
    FiatExchangeClients.CoinBase,
]

export const getExchangeRate = async (
    fiatSymbol: string,
    symbol: VeChainToken,
): Promise<CurrencyExchangeRate> => {
    for (const provider of exchangeProviders) {
        try {
            const exchange = await provider.getExchangeRate(fiatSymbol, symbol)
            return exchange
        } catch (e) {
            error(e)
        }
    }
    throw new Error("Failed to get exchange rate from any provider")
}
