import { PersistedState } from "redux-persist/es/types"
import { DiscoveryState } from "~Storage/Redux"

export const Migration14 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: DiscoveryState = state.discovery

    const newState: DiscoveryState = {
        ...currentState,
        bannerInteractions: {},
    }

    return {
        ...state,
        discovery: newState,
    } as PersistedState
}
