import { NETWORK_TYPE } from "~Model/Network/enums"
import { PersistedState } from "redux-persist/es/types"
import { NftSliceState } from "~Storage/Redux"

export const Migration18 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: NftSliceState = state.nft

    const newState: NftSliceState = {
        ...currentState,
        reportedCollections: {
            [NETWORK_TYPE.MAIN]: {},
            [NETWORK_TYPE.TEST]: {},
            [NETWORK_TYPE.SOLO]: {},
            [NETWORK_TYPE.OTHER]: {},
        },
    }

    return {
        ...state,
        nft: newState,
    } as PersistedState
}
