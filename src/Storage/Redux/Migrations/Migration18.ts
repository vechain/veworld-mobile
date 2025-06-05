import { PersistedState } from "redux-persist/es/types"

/**
 * Migration 18: No-op migration
 */
export const Migration18 = (state: PersistedState): PersistedState => {
    return state
}
