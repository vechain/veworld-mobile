import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { VeChatNetwork } from "../Types"

export interface VeChatState {
    registerdClients: { dev: string[]; production: string[]; local: string[] }
    selectedNetwork: VeChatNetwork
    dbEncryptionKeys: {
        [Network in VeChatNetwork as `veChat-${Lowercase<string & Network>}`]?: string
    }
}

const initialState: VeChatState = {
    registerdClients: { dev: [], production: [], local: [] },
    selectedNetwork: "production",
    dbEncryptionKeys: {},
}

//TODO: Refactor of all the slices names

export const VeChatSlice = createSlice({
    name: "veChat",
    initialState,
    reducers: {
        addXmtpClient: (state, action: PayloadAction<string>) => {
            // if (!state.clients.find(client => client.address === action.payload.address)) {
            //     state.clients.push(action.payload)
            // }
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

        clearDbEncryptionKey: state => {
            if (state.dbEncryptionKeys[`veChat-${state.selectedNetwork}`]) {
                delete state.dbEncryptionKeys[`veChat-${state.selectedNetwork}`]
            }
        },

        resetVeChatState: () => initialState,
    },
})

export const { addXmtpClient, changeXmtpNetwork, resetVeChatState, setDbEncryptionKey, clearDbEncryptionKey } =
    VeChatSlice.actions
