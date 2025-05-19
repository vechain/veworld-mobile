import { PersistedState } from "redux-persist/es/types"
import { NetworkState } from "~Storage/Redux"

export const Migration15 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: NetworkState = state.networks

    const newState: NetworkState = {
        ...currentState,
        hardfork: {},
    }

    return {
        ...state,
        networks: newState,
    } as PersistedState
}
