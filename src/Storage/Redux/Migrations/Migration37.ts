import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { AmountInputMode } from "~Model"
import { debug } from "~Utils"
import { UserPreferenceState } from "../Slices"

export const Migration37 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 37: Setting default amount input mode to fiat")

    // @ts-expect-error
    const currentUserPreferenceState: UserPreferenceState = state.userPreferences

    const newUserPreferenceState = {
        ...currentUserPreferenceState,
        defaultAmountInputMode: AmountInputMode.FIAT,
    } satisfies UserPreferenceState

    return {
        ...state,
        userPreferences: newUserPreferenceState,
    } as PersistedState
}
