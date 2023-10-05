import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ProposalTypes, SessionTypes } from "@walletconnect/types"
import { Verify } from "@walletconnect/types/dist/types/core/verify"

export interface DappInfo {
    name: string
    url: string
    icon: string | null
}

export type WalletConnectPendingSession = {
    id: number
    dapp: DappInfo
    proposalNamespaces: ProposalTypes.RequiredNamespaces
    verifyContext: Verify.Context["verified"]
}

export type WalletConnectSession = {
    topic: string
    chains: string[]
    account: string
    namespaces: SessionTypes.Namespaces
    verifyContext: Verify.Context["verified"]
}

interface SessionMapping {
    [sessionId: string]: WalletConnectSession
}

interface BaseRequest {
    topic: string
    requestId: number
    account: string
    chainId: string
}

export interface CertificateRequest extends BaseRequest {
    message: Connex.Vendor.CertMessage
    options: Connex.Signer.CertOptions
    readonly type: "cert"
}

export interface TransactionRequest extends BaseRequest {
    message: Connex.Vendor.TxMessage
    options: Connex.Signer.TxOptions
    readonly type: "tx"
}

export type WalletConnectRequest = CertificateRequest | TransactionRequest

export const isTransactionRequest = (
    request: WalletConnectRequest,
): request is TransactionRequest => request.type === "tx"

export interface WalletConnectState {
    sessions: SessionMapping
    pendingSession: WalletConnectPendingSession | null
    pendingRequests: WalletConnectRequest[]
    deepLinks: string[]
}

export const initialWalletConnectState: Readonly<WalletConnectState> = {
    sessions: {},
    pendingSession: null,
    pendingRequests: [],
    deepLinks: [],
}

export const WalletConnectSlice = createSlice({
    name: "walletConnect",
    initialState: initialWalletConnectState,
    reducers: {
        upsertSession: (
            state,
            action: PayloadAction<{
                wcSession: WalletConnectSession
            }>,
        ) => {
            const { wcSession } = action.payload
            state.sessions[wcSession.topic] = wcSession
        },

        removeSession: (state, action: PayloadAction<{ topic: string }>) => {
            const { topic } = action.payload

            delete state.sessions[topic]
        },

        addPendingSession: (
            state,
            action: PayloadAction<{
                pendingSession: WalletConnectPendingSession
            }>,
        ) => {
            const { pendingSession } = action.payload
            state.pendingSession = pendingSession
        },

        removePendingSession: state => {
            state.pendingSession = null
        },

        addDeepLink: (state, action: PayloadAction<{ deepLink: string }>) => {
            const { deepLink } = action.payload
            state.deepLinks.push(deepLink)
        },

        removeDeepLink: (
            state,
            action: PayloadAction<{ deepLink: string }>,
        ) => {
            const { deepLink } = action.payload
            state.deepLinks = state.deepLinks.filter(link => link !== deepLink)
        },

        addRequest: (
            state,
            action: PayloadAction<{
                request: WalletConnectRequest
            }>,
        ) => {
            const { request } = action.payload
            state.pendingRequests.push(request)
        },

        removeRequest: (
            state,
            action: PayloadAction<{
                requestId: number
                account: string
            }>,
        ) => {
            const { requestId } = action.payload
            state.pendingRequests = state.pendingRequests.filter(
                req => req.requestId !== requestId,
            )
        },
    },
})

export const {
    upsertSession,
    removeSession,
    addPendingSession,
    removePendingSession,
    addRequest,
    removeRequest,
    addDeepLink,
    removeDeepLink,
} = WalletConnectSlice.actions
export const { reducer: walletConnectReducer } = WalletConnectSlice
