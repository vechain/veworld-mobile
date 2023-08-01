import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { DelegationType } from "~Model/Delegation"
import { debug } from "~Utils"
import { PersistedState } from "redux-persist/es/types"
import { LocalAccountWithDevice } from "~Model"

/**
 * Migration 2: Previously delegation was stored once for all networks
 * - Now delegation is stored per network
 */

export const Migration2 = (state: PersistedState): PersistedState => {
    debug("Performing migration 2")

    const updatedDelegation: DelegationStateV2 = {
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

type DelegationStateV1 = {
    urls: string[]
    defaultDelegationOption: DelegationType
    defaultDelegationAccount?: LocalAccountWithDevice
    defaultDelegationUrl?: string
}

//Migrate to use the genesis Id as the network identifier, so we can have different delegation options per network
type DelegationStateV2 = Record<string, DelegationStateV1>
