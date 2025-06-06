import { PersistedState } from "redux-persist/es/types"
import { DelegationState } from "../Slices"
import { VTHO } from "~Constants"

export const Migration18 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: Record<string, DelegationState> = state.delegation

    const newState: Record<string, DelegationState> = Object.fromEntries(
        Object.entries(currentState).map(([genesisId, value]) => [genesisId, { ...value, defaultToken: VTHO.symbol }]),
    )

    return {
        ...state,
        delegation: newState,
    } as PersistedState
}
