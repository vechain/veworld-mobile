import { PersistedState } from "redux-persist/es/types"
import { AppVersion } from "~Model/AppVersion"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"

export const Migration23 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 20: Adding changelog fields to version update state")

    // @ts-ignore
    const currentState: AppVersion = state.versionUpdate

    if (!currentState || Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: AppVersion = {
        ...currentState,
        shouldShowChangelog: false,
        changelogKey: null,
    }

    return {
        ...state,
        versionUpdate: newState,
    } as PersistedState
}
