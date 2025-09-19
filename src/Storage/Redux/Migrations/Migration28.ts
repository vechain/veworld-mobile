import { PersistedState } from "redux-persist/es/types"
import { UserPreferenceState } from "~Storage/Redux"
import nacl from "tweetnacl"
import { encodeBase64 } from "tweetnacl-util"

export const Migration28 = (state: PersistedState): PersistedState => {
    // @ts-ignore
    const currentState: UserPreferenceState = state.userPreferences

    // Generate a new key pair for signing session tokens for external dapps connections
    const keyPair = nacl.sign.keyPair()

    const newState: UserPreferenceState = {
        ...currentState,
        signKeyPair: {
            publicKey: encodeBase64(keyPair.publicKey),
            privateKey: encodeBase64(keyPair.secretKey),
        },
    }

    return {
        ...state,
        userPreferences: newState,
    } as PersistedState
}
