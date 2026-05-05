import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { initialB3moState } from "../Slices/B3mo"

export const Migration38 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 38: Adding B3MO slices")

    return {
        ...state,
        b3mo: initialB3moState,
    } as PersistedState
}
