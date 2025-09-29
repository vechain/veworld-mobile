import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { AppVersion } from "~Model/AppVersion"

export const Migration28 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 28: Resetting custom apps")

    // @ts-ignore
    const currentState: AppVersion = state.versionUpdate

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: AppVersion = {
        ...currentState,
        changelogDismissed: false,
    }

    return {
        ...state,
        versionUpdate: newState,
    } as PersistedState
}
