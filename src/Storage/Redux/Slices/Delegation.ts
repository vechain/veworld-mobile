import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"

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
}

const initialState: Record<string, DelegationState> = {
    [defaultMainNetwork.genesis.id]: {
        urls: [],
        defaultDelegationOption: DelegationType.NONE,
    },
    [defaultTestNetwork.genesis.id]: {
        urls: [],
        defaultDelegationOption: DelegationType.NONE,
    },
}

export const DelegationSlice = createSlice({
    name: "delegation",
    initialState,
    reducers: {
        addDelegationUrl: (
            state,
            action: PayloadAction<{ url: string; genesisId: string }>,
        ) => {
            const { url, genesisId } = action.payload

            if (!state[genesisId]) {
                state[genesisId] = {
                    urls: [url],
                    defaultDelegationOption: DelegationType.NONE,
                }
            }

            if (!state[genesisId].urls.includes(url)) {
                state[genesisId].urls.push(url)
            }
        },
        deleteDelegationUrl: (
            state,
            action: PayloadAction<{ url: string; genesisId: string }>,
        ) => {
            const { url, genesisId } = action.payload

            if (!state[genesisId]) {
                state[genesisId] = {
                    urls: [],
                    defaultDelegationOption: DelegationType.NONE,
                }
            } else {
                state[genesisId].urls = state[genesisId].urls.filter(
                    _url => _url !== url,
                )
            }
        },
        setDefaultDelegationOption: (
            state,
            action: PayloadAction<{ type: DelegationType; genesisId: string }>,
        ) => {
            const { type, genesisId } = action.payload

            if (!state[genesisId]) {
                state[genesisId] = {
                    urls: [],
                    defaultDelegationOption: type,
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
                }
            }

            state[genesisId].defaultDelegationUrl = url
        },
        resetDelegationState: () => initialState,
    },
})

export const {
    addDelegationUrl,
    setDefaultDelegationOption,
    setDefaultDelegationAccount,
    setDefaultDelegationUrl,
    deleteDelegationUrl,
    resetDelegationState,
} = DelegationSlice.actions
