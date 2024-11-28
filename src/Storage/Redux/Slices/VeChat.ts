import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { VeChatConversation, VeChatConversations, VeChatNetwork } from "../Types"

export interface VeChatState {
    registerdClients: { dev: string[]; production: string[]; local: string[] }
    selectedNetwork: VeChatNetwork
    dbEncryptionKeys: {
        [Network in VeChatNetwork as `veChat-${Lowercase<string & Network>}`]?: string
    }
    conversations: VeChatConversations
}

const initialState: VeChatState = {
    registerdClients: { dev: [], production: [], local: [] },
    selectedNetwork: "production",
    dbEncryptionKeys: {},
    conversations: {},
}

//TODO: Refactor of all the slices names

export const VeChatSlice = createSlice({
    name: "veChat",
    initialState,
    reducers: {
        addXmtpClient: (state, action: PayloadAction<string>) => {
            if (!state.registerdClients[state.selectedNetwork].find(address => address === action.payload))
                state.registerdClients[state.selectedNetwork].push(action.payload)
        },

        changeXmtpNetwork: (state, action: PayloadAction<VeChatNetwork>) => {
            state.selectedNetwork = action.payload
        },

        setDbEncryptionKey: (state, action: PayloadAction<string>) => {
            if (!state.dbEncryptionKeys[`veChat-${state.selectedNetwork}`])
                state.dbEncryptionKeys[`veChat-${state.selectedNetwork}`] = action.payload
        },

        addConversation: (state, action: PayloadAction<{ topic: string; conversation: VeChatConversation }>) => {
            const { topic, conversation } = action.payload
            if (!state.conversations[topic]) {
                state.conversations[topic] = conversation
            }
        },

        updateConversation: (
            state,
            action: PayloadAction<{ topic: string; conversation: Partial<VeChatConversation> }>,
        ) => {
            const { topic, conversation } = action.payload
            if (state.conversations[topic]) {
                state.conversations[topic] = { ...state.conversations[topic], ...conversation }
            }
        },

        deleteConversation: (state, action: PayloadAction<string>) => {
            if (state.conversations[action.payload]) {
                const currentTimestamp = new Date().getTime()
                state.conversations[action.payload] = {
                    ...state.conversations[action.payload],
                    deletedAt: currentTimestamp,
                }
            }
        },

        clearDbEncryptionKey: state => {
            if (state.dbEncryptionKeys[`veChat-${state.selectedNetwork}`]) {
                delete state.dbEncryptionKeys[`veChat-${state.selectedNetwork}`]
            }
        },

        resetVeChatState: () => initialState,
    },
})

export const {
    addXmtpClient,
    changeXmtpNetwork,
    resetVeChatState,
    addConversation,
    updateConversation,
    deleteConversation,
    setDbEncryptionKey,
    clearDbEncryptionKey,
} = VeChatSlice.actions
