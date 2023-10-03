import { PersistedState } from "redux-persist/es/types"
import { debug } from "~Utils"

/**
 * Migration 4: Remove the wallet connect state
 * - Previously we stored the wallet connect state in redux, but that data was also persisted by the wallet connect libraries, causing inconsistencies
 * - This migration removes the wallet connect state from redux
 */

export const Migration4 = (state: PersistedState): PersistedState => {
    debug("Performing migration 4")

    return {
        ...state,
        // @ts-ignore
        sessions: undefined,
    }
}
