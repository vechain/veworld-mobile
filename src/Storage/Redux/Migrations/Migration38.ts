import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { UserPreferenceState } from "../Slices"

export const Migration38 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 38: Setting dismissedAppleMigrationBanner to undefined")

    // @ts-expect-error
    const currentUserPreferenceState: UserPreferenceState = state.userPreferences

    const newUserPreferenceState = {
        ...currentUserPreferenceState,
        dismissedAppleMigrationBanner: undefined,
    } satisfies UserPreferenceState

    return {
        ...state,
        userPreferences: newUserPreferenceState,
    } as PersistedState
}
