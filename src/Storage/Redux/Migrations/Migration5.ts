import { PersistedState } from "redux-persist/es/types"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"

/**
 * Migration 5: Adding a timestamp for when the app presented the reset screen to the user
 */
export const Migration5 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 5")

    // @ts-ignore
    const currentState: OldState = state.userPreferences

    let newState = {
        ...currentState,
        appResetTimestamp: undefined,
    }

    return {
        ...state,
        userPreferences: newState,
    } as PersistedState
}
