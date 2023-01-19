// import FiatExchangeClients from "../../clients/fiat"
// import { FiatExchangeClient } from "../../clients/fiat/model"

import { debug, error, veWorldErrors, warn } from "~Common"
import { CurrencyExchangeRate, VeChainToken } from "~Model"
import { AppThunk, getSettings, updateCurrency } from "~Storage/Caches"

// TODO: To be ported?
//ALWAYS put CoinGecko first
// const exchangeProviders: FiatExchangeClient[] = [
//     FiatExchangeClients.CoinGecko,
//     FiatExchangeClients.CoinBase,
// ]

const getCurrencies = async (): Promise<string[]> => {
    debug("Getting currencies")

    for (const provider of exchangeProviders) {
        try {
            return await provider.getCurrencies()
        } catch (e) {
            warn("Failed to get currencies from provider: ", provider)
        }
    }
    throw veWorldErrors.rpc.internal({
        message: "Failed to get available currencies from any provider",
    })
}

const getExchangeRate = async (
    fiatSymbol: string,
    symbol: VeChainToken,
): Promise<CurrencyExchangeRate> => {
    debug("Getting exchange rate")

    for (const provider of exchangeProviders) {
        try {
            return await provider.getExchangeRate(fiatSymbol, symbol)
        } catch (e) {
            error(
                `Failed to get exchange rate from provider (${provider.name}): ${e}`,
            )
        }
    }
    throw veWorldErrors.rpc.internal({
        message: "Failed to get exchange rate from any provider",
    })
}

const updateCurrencyCache =
    (): AppThunk<Promise<void>> => async (dispatch, getState) => {
        debug("Initialising currency cache")

        const settings = getSettings(getState())

        const vetExchangeRate = await getExchangeRate(
            settings.general.currency,
            "VET",
        )
        const vthoExchangeRate = await getExchangeRate(
            settings.general.currency,
            "VTHO",
        )

        const availableCurrencies = await getCurrencies()

        dispatch(
            updateCurrency({
                vet: vetExchangeRate,
                vtho: vthoExchangeRate,
                availableCurrencies,
            }),
        )
    }

export default {
    updateCurrencyCache,
    getExchangeRate,
    getCurrencies,
}
