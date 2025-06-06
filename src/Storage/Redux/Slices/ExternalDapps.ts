import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { NETWORK_TYPE } from "~Model"

export type KeyPair = {
    publicKey: string
    privateKey: string
}

export type SessionState = {
    keyPair: KeyPair
    appUrl?: string
    appName: string
    sharedSecret: string
    address: string
}

export type ExternalDappsState = {
    sessions: { [Network in NETWORK_TYPE]: Record<string, SessionState> }
    blackListedApps: string[]
}

export const initialExternalDappsState: ExternalDappsState = {
    sessions: { [NETWORK_TYPE.MAIN]: {}, [NETWORK_TYPE.TEST]: {}, [NETWORK_TYPE.OTHER]: {}, [NETWORK_TYPE.SOLO]: {} },
    blackListedApps: [],
}

export const ExternalDappsSlice = createSlice({
    name: "externalDapps",
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
                address: string
            }>,
        ) => {
            const { network, keyPair, appPublicKey, appUrl, appName, sharedSecret, address } = action.payload

            state.sessions[network][appPublicKey] = {
                keyPair,
                appUrl,
                appName,
                sharedSecret,
                address,
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
            delete state.sessions[network][appPublicKey]
        },
        addBlackListedApp: (state: Draft<ExternalDappsState>, action: PayloadAction<string>) => {
            state.blackListedApps.push(action.payload)
        },
        removeBlackListedApp: (state: Draft<ExternalDappsState>, action: PayloadAction<string>) => {
            state.blackListedApps = state.blackListedApps.filter(app => app !== action.payload)
        },
        resetExternalDappsState: () => {
            return initialExternalDappsState
        },
    },
})

export const {
    newExternalDappSession,
    deleteExternalDappSession,
    addBlackListedApp,
    removeBlackListedApp,
    resetExternalDappsState,
} = ExternalDappsSlice.actions
