import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { NETWORK_TYPE } from "~Model"

type KeyPair = {
    publicKey: string
    privateKey: string
}

/**
 * One account can have multiple sessions.
 *
 * Mapping account topic => verify context
 */
type SessionState = {
    keyPair: KeyPair
    appUrl?: string
    appName: string
    sharedSecret: string
}

export type ExternalDappsState = {
    [Network in NETWORK_TYPE]: Record<string, SessionState>
}

export const initialExternalDappsState: ExternalDappsState = {
    [NETWORK_TYPE.MAIN]: {},
    [NETWORK_TYPE.TEST]: {},
    [NETWORK_TYPE.OTHER]: {},
    [NETWORK_TYPE.SOLO]: {},
}

export const ExternalDappsSlice = createSlice({
    name: "externalDappSessions",
    initialState: initialExternalDappsState,
    reducers: {
        newExternalDappSession: (
            state: Draft<ExternalDappsState>,
            action: PayloadAction<{
                network: NETWORK_TYPE
                keyPair: KeyPair
                appPublicKey: string
                appUrl: string
                appName: string
                sharedSecret: string
            }>,
        ) => {
            const { network, keyPair, appPublicKey, appUrl, appName, sharedSecret } = action.payload

            state[network][appPublicKey] = {
                keyPair,
                appUrl,
                appName,
                sharedSecret,
            }
        },
        deleteExternalDappSession: (
            state: Draft<ExternalDappsState>,
            action: PayloadAction<{
                network: NETWORK_TYPE
                appPublicKey: string
            }>,
        ) => {
            const { network, appPublicKey } = action.payload
            delete state[network][appPublicKey]
        },
        resetExternalDappsState: () => {
            return initialExternalDappsState
        },
    },
})

export const { newExternalDappSession, deleteExternalDappSession, resetExternalDappsState } = ExternalDappsSlice.actions
