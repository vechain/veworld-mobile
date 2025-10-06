import { PersistedState } from "redux-persist/es/types"
import { UserPreferenceState } from "../Slices/UserPreferences"

export const Migration30 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: UserPreferenceState = state.userPreferences

    const newState: UserPreferenceState = {
        ...currentState,
        hideNewUserVeBetterCard: false,
    }

    return {
        ...state,
        userPreferences: newState,
    } as PersistedState
}
