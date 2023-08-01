import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { DelegationType } from "~Model/Delegation"
import { debug } from "~Utils"
import { PersistedState } from "redux-persist/es/types"

/**
 * Migration 2: Previously delegation was stored once for all networks
 * - Now delegation is stored per network
 */

export const Migration2 = (state: PersistedState): PersistedState => {
    debug("Performing migration 2")

    // Record<string, DelegationState>
    const updatedDelegation = {
        [defaultMainNetwork.genesis.id]: {
            urls: [],
            defaultDelegationOption: DelegationType.NONE,
        },
        [defaultTestNetwork.genesis.id]: {
            urls: [],
            defaultDelegationOption: DelegationType.NONE,
        },
    }

    return {
        ...state,
        delegation: updatedDelegation,
    } as PersistedState
}
