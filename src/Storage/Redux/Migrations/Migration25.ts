import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { DiscoveryState } from "../Slices"

export const Migration25 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 25: Adding favicon to tabs")

    // @ts-ignore
    const currentState: DiscoveryState = state.discovery

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: DiscoveryState = {
        ...currentState,
        tabsManager: {
            ...currentState.tabsManager,
            tabs: currentState.tabsManager.tabs.map(tab => ({
                ...tab,
                favicon: undefined,
            })),
        },
    }

    return {
        ...state,
        discovery: newState,
    } as PersistedState
}
