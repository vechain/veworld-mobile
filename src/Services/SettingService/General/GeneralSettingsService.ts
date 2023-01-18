import { CURRENCY, Settings, Theme } from "~Model"
import { AppThunk } from "~Storage/Caches"
import SettingService from "../SettingService"

export const updateCurrency =
    (currency: CURRENCY): AppThunk<Promise<void>> =>
    async dispatch => {
        const currencyUpdate = (settings: Settings) =>
            (settings.general.currency = currency)

        return dispatch(SettingService.update(currencyUpdate))
    }

export const toggleShowNoBalanceTokens =
    (): AppThunk<Promise<void>> => async dispatch => {
        const showNoBalanceTokensUpdate = (settings: Settings) =>
            (settings.general.hideNoBalanceTokens =
                !settings.general.hideNoBalanceTokens)

        return dispatch(SettingService.update(showNoBalanceTokensUpdate))
    }

// TODO: remove
export const selectTheme =
    (theme: Theme): AppThunk<Promise<void>> =>
    async dispatch => {
        //So we can access the theme when locked
        window.localStorage.setItem(WINDOW_THEME_KEY, theme)

        const themeUpdate = (settings: Settings) =>
            (settings.general.theme = theme)

        return dispatch(SettingService.update(themeUpdate))
    }
