import { PersistedState } from "redux-persist/es/types"
import { CURRENCY_FORMATS, ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { UserPreferenceState } from "../Slices"

export const Migration10 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: UserPreferenceState = state.userPreferences

    //We don't have any state, so return immediately
    if (Object.keys(currentState).length === 0) {
        debug(ERROR_EVENTS.SECURITY, "================= **** No state to migrate **** =================")
        return state
    }

    const newState: UserPreferenceState = {
        ...currentState,
        currencyFormat: CURRENCY_FORMATS.SYSTEM,
    }

    debug(ERROR_EVENTS.SECURITY, "=== ** Migrated State ** ===", newState.showJailbrokeWarning)

    return {
        ...state,
        userPreferences: newState,
    } as PersistedState
}
