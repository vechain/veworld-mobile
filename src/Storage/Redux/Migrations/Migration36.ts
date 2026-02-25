import { PersistedState } from "redux-persist"
import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"
import { UserPreferenceState } from "../Slices"

export const Migration36 = (state: PersistedState): PersistedState => {
    debug(ERROR_EVENTS.SECURITY, "Performing migration 36: Setting hideStargateXVeBetterBanner to false")

    // @ts-expect-error
    const currentUserPreferenceState: UserPreferenceState = state.userPreferences

    const newUserPreferenceState = {
        ...currentUserPreferenceState,
        hideStargateXVeBetterBanner: false,
    } satisfies UserPreferenceState

    return {
        ...state,
        userPreferences: newUserPreferenceState,
    } as PersistedState
}
