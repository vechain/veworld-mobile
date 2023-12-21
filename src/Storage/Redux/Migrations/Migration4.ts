import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"

/**
 * Migration 3: Previously, sessions were stored as an array of sessions per account
 * - Now connected apps are stored with their verify context
 */

export const Migration4 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURTIY, "Performing migration 3")

    // @ts-ignore
    const currentState = state.currencies

    if ("exchangeRates" in currentState) {
        delete currentState.exchangeRates
    }

    // @ts-ignore
    const tokens = state.tokens

    if ("dashboardChartData" in tokens) {
        delete tokens.dashboardChartData
    }

    if ("assetDetailChartData" in tokens) {
        delete tokens.assetDetailChartData
    }

    if ("coinMarketInfo" in tokens) {
        delete tokens.coinMarketInfo
    }

    if ("coinGeckoTokens" in tokens) {
        delete tokens.coinGeckoTokens
    }

    if ("chartDataIsLoading" in tokens) {
        delete tokens.chartDataIsLoading
    }

    return {
        ...state,
        currencies: currentState,
        tokens,
    } as PersistedState
}
