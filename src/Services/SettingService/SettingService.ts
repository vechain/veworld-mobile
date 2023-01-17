import { AppThunk } from "~Storage/Caches/cache"
import { updateSettings } from "~Storage/Caches/SettingsCache"
import { Settings } from "~Model/Settings"
import SettingStore from "~Storage/Stores/SettingStore"
import { getDefaultSettings } from "~Common/constants/Settings/SettingsConstants"
import { veWorldErrors } from "~Common/Errors"
import { debug, error } from "~Common/Logger/Logger"

const get = async (): Promise<Settings> => SettingStore.get()

const reset = (): AppThunk<Promise<void>> => async dispatch => {
    debug("Resetting settings")

    try {
        const defaultSettings = getDefaultSettings()
        await SettingStore.insert(defaultSettings)
        dispatch(updateSettings(defaultSettings))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to reset settings",
        })
    }
}

const initialiseCache = (): AppThunk<Promise<void>> => async dispatch => {
    debug("Initialising settings cache")

    try {
        const settings = await get()
        dispatch(updateSettings(settings))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to initialise settings cache",
        })
    }
}

/**
 * A function to update the encrypted store. All updates should be performed via this function
 *
 * It assumes that the settings already exist in store. If they don't a resourceNotFound error will be thrown
 *
 * @param settingsUpdate {function} - a function to mutate the previous settings
 */
const update =
    (settingsUpdate: (settings: Settings) => void): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Updating settings")

        try {
            const settings = await SettingStore.update([settingsUpdate])

            //Update the cache
            dispatch(updateSettings(settings))
        } catch (e) {
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "failed_to_update_settings",
            })
        }
    }

const lock = () => SettingStore.lock()

const unlock = (key: string) => SettingStore.unlock(key)

export default {
    get,
    initialiseCache,
    lock,
    reset,
    unlock,
    update,
}
