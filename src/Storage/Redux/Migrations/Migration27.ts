import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { DiscoveryState } from "../Slices"

export const Migration27 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 27: Resetting custom apps")

    // @ts-ignore
    const currentState: DiscoveryState = state.discovery

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: DiscoveryState = {
        ...currentState,
        custom: [],
    }

    return {
        ...state,
        discovery: newState,
    } as PersistedState
}
