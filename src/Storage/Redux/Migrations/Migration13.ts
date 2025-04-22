import { PersistedState } from "redux-persist/es/types"
import { DiscoveryDApp, ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { DiscoveryState } from "~Storage/Redux"

const filterFavorites = (favorite: DiscoveryDApp, index: number, self: DiscoveryDApp[]) => {
    // Return true only for the first occurrence of a favorite with the same base URL
    // and only if it's not a custom dApp
    if (favorite.isCustom) {
        return false
    }

    const baseUrl = new URL(favorite.href).origin
    return (
        index ===
        self.findIndex(f => {
            try {
                const otherBaseUrl = new URL(f.href).origin
                return otherBaseUrl === baseUrl
            } catch {
                return false
            }
        })
    )
}

export const Migration13 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: DiscoveryState = state.discovery

    //We don't have any state, so return immediately
    if (currentState.favorites.length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: DiscoveryState = {
        ...currentState,
        favorites: currentState.favorites.filter(filterFavorites),
    }

    return {
        ...state,
        discovery: newState,
    } as PersistedState
}
