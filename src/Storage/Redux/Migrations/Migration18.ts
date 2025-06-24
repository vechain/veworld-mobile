import { PersistedState } from "redux-persist/es/types"
import { UserPreferenceState } from "../Slices/UserPreferences"

export const Migration18 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: UserPreferenceState = state.userPreferences

    const newState: UserPreferenceState = {
        ...currentState,
        hideStargateBannerHomeScreen: false,
        hideStargateBannerVETScreen: false,
    }

    return {
        ...state,
        userPreferences: newState,
    } as PersistedState
}
