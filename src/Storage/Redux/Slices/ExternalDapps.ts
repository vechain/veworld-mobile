import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"

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
    sessions: { [genesisId: string]: Record<string, SessionState> }
    blackListedApps: string[]
}

export const initialExternalDappsState: ExternalDappsState = {
    sessions: {},
    blackListedApps: [],
}

export const ExternalDappsSlice = createSlice({
    name: "externalDapps",
    initialState: initialExternalDappsState,
    reducers: {
        newExternalDappSession: (
            state: Draft<ExternalDappsState>,
            action: PayloadAction<{
                genesisId: string
                keyPair: KeyPair
                appPublicKey: string
                appUrl: string
                appName: string
                sharedSecret: string
                address: string
            }>,
        ) => {
            const { genesisId, keyPair, appPublicKey, appUrl, appName, sharedSecret, address } = action.payload

            if (!state.sessions[genesisId]) {
                state.sessions[genesisId] = {}
            }

            state.sessions[genesisId][appPublicKey] = {
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
                genesisId: string
                appPublicKey: string
            }>,
        ) => {
            const { genesisId, appPublicKey } = action.payload
            delete state.sessions[genesisId][appPublicKey]
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
