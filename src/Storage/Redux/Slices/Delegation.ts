import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { defaultMainNetwork, defaultTestNetwork, VTHO } from "~Constants/Constants"

/**
 * Delegation State
 * @typedef {Object} DelegationState
 * @property {string[]} urls - urls array available for delegation
 */
export interface DelegationState {
    urls: string[]
    defaultDelegationOption: DelegationType
    defaultDelegationAccount?: LocalAccountWithDevice
    defaultDelegationUrl?: string
    defaultToken: string
}

const initialState: Record<string, DelegationState> = {
    [defaultMainNetwork.genesis.id]: {
        urls: [],
        defaultDelegationOption: DelegationType.NONE,
        defaultToken: VTHO.symbol,
    },
    [defaultTestNetwork.genesis.id]: {
        urls: [],
        defaultDelegationOption: DelegationType.NONE,
        defaultToken: VTHO.symbol,
    },
}

export const DelegationSlice = createSlice({
    name: "delegation",
    initialState,
    reducers: {
        addDelegationUrl: (
            state,
            action: PayloadAction<{
                url: string
                genesisId: string
                callbackIfAlreadyPresent: () => void
            }>,
        ) => {
            const { url, genesisId, callbackIfAlreadyPresent } = action.payload

            if (!state[genesisId]) {
                state[genesisId] = {
                    urls: [url],
                    defaultDelegationOption: DelegationType.NONE,
                    defaultToken: VTHO.symbol,
                }
            }

            if (!state[genesisId].urls.includes(url)) {
                state[genesisId].urls.push(url)
            } else {
                callbackIfAlreadyPresent()
            }
        },
        deleteDelegationUrl: (state, action: PayloadAction<{ url: string; genesisId: string }>) => {
            const { url, genesisId } = action.payload

            if (!state[genesisId]) {
                state[genesisId] = {
                    urls: [],
                    defaultDelegationOption: DelegationType.NONE,
                    defaultToken: VTHO.symbol,
                }
            } else {
                state[genesisId].urls = state[genesisId].urls.filter(_url => _url !== url)
            }
        },
        setDefaultDelegationOption: (state, action: PayloadAction<{ type: DelegationType; genesisId: string }>) => {
            const { type, genesisId } = action.payload

            if (!state[genesisId]) {
                state[genesisId] = {
                    urls: [],
                    defaultDelegationOption: type,
                    defaultToken: VTHO.symbol,
                }
            }

            state[genesisId].defaultDelegationOption = type
        },
        setDefaultDelegationAccount: (
            state,
            action: PayloadAction<{
                delegationAccount: LocalAccountWithDevice | undefined
                genesisId: string
            }>,
        ) => {
            const { delegationAccount, genesisId } = action.payload

            if (!state[genesisId]) {
                state[genesisId] = {
                    urls: [],
                    defaultDelegationOption: DelegationType.NONE,
                    defaultToken: VTHO.symbol,
                }
            }

            state[genesisId].defaultDelegationAccount = delegationAccount
        },
        setDefaultDelegationUrl: (
            state,
            action: PayloadAction<{
                url: string | undefined
                genesisId: string
            }>,
        ) => {
            const { url, genesisId } = action.payload

            if (!state[genesisId]) {
                state[genesisId] = {
                    urls: url ? [url] : [],
                    defaultDelegationOption: DelegationType.NONE,
                    defaultToken: VTHO.symbol,
                }
            }

            state[genesisId].defaultDelegationUrl = url
        },
        resetDelegationState: () => initialState,
        setDefaultDelegationToken: (
            state,
            action: PayloadAction<{
                genesisId: string
                token: string
            }>,
        ) => {
            const { token, genesisId } = action.payload
            if (!state[genesisId]) {
                state[genesisId] = {
                    urls: [],
                    defaultDelegationOption: DelegationType.NONE,
                    defaultToken: token,
                }
            }
            state[genesisId].defaultToken = token
        },
    },
})

export const {
    addDelegationUrl,
    setDefaultDelegationOption,
    setDefaultDelegationAccount,
    setDefaultDelegationUrl,
    deleteDelegationUrl,
    resetDelegationState,
    setDefaultDelegationToken,
} = DelegationSlice.actions
