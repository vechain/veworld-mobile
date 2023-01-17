import ConnectedAppStore from "~Storage/Stores/ConnectedAppStore"
import { AppThunk } from "~Storage/Caches/cache"
import { ConnectedAppStorageData } from "~Model/ConnectedApp"
import { updateConnectedApps } from "~Storage/Caches/ConnectedAppCache"
import { veWorldErrors } from "~Common/Errors"
import { debug, error, warn } from "~Common/Logger/Logger"

const get = async () => {
    return await ConnectedAppStore.get()
}

const update =
    (
        connectedAppUpdate: (apps: ConnectedAppStorageData) => void,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Updating a connected app")

        try {
            // Update & Get the result
            const upd = await ConnectedAppStore.update([connectedAppUpdate])
            // Update the cache
            dispatch(updateConnectedApps(upd.apps))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to reset connected app store",
            })
        }
    }

const initialiseCache = (): AppThunk<Promise<void>> => async dispatch => {
    debug("Initialising ConnectedApp cache")

    try {
        const storage = await get()
        dispatch(updateConnectedApps(storage.apps))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to initialise connected app cache",
        })
    }
}

const reset = (): AppThunk<Promise<void>> => async dispatch => {
    debug("Resetting ConnectedApp store")

    try {
        await ConnectedAppStore.insert({ apps: [] })
        dispatch(updateConnectedApps([]))
    } catch (e) {
        error(e)
        throw veWorldErrors.rpc.internal({
            error: e,
            message: "Failed to reset connected app store",
        })
    }
}

const approve =
    (originUrl: string): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Approving a ConnectedApp")

        try {
            const connectedAppUpdate = (storage: ConnectedAppStorageData) => {
                const index = storage.apps.findIndex(app => app === originUrl)

                if (index === -1) storage.apps.push(originUrl)
            }

            await dispatch(update(connectedAppUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to approve connected app",
            })
        }
    }

export const remove =
    (appUrl: string): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Removing a ConnectedApp")

        try {
            const connectedAppUpdate = (storage: ConnectedAppStorageData) => {
                const index = storage.apps.findIndex(app => app === appUrl)

                if (index < 0) {
                    warn("App not found, no action required")
                } else {
                    storage.apps.splice(index, 1)
                }
            }

            await dispatch(update(connectedAppUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to remove connected app",
            })
        }
    }

const lock = () => ConnectedAppStore.lock()

const unlock = (key: string) => ConnectedAppStore.unlock(key)

export default {
    get,
    update,
    reset,
    initialiseCache,
    approve,
    remove,
    lock,
    unlock,
}
