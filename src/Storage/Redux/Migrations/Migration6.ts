import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { DiscoveryState } from "../Slices"

/**
 * Migration 3: Previously, sessions were stored as an array of sessions per account
 * - Now connected apps are stored with their verify context
 */

export const Migration6 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: DiscoveryState = state.discovery

    //We don't have any state, so return immediately
    if (Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: DiscoveryState = {
        ...currentState,
        featured: [],
    }

    debug(ERROR_EVENTS.SECURITY, "=== ** Migrated State ** ===", newState.featured)

    return {
        ...state,
        discovery: newState,
    } as PersistedState
}
