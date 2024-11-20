import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Client } from "@xmtp/react-native-sdk"
import { XmtpNetwork } from "../Types"

export interface XmtpState {
    registerdClients: string[]
    clients: Client[]
    selectedNetwork: XmtpNetwork
    dbEncryptionKeys: {
        [Network in XmtpNetwork as `veChat-${Lowercase<string & Network>}`]?: string
    }
}

const initialState: XmtpState = {
    registerdClients: [],
    clients: [],
    selectedNetwork: __DEV__ ? "dev" : "production",
    dbEncryptionKeys: {},
}

export const XmtpSlice = createSlice({
    name: "xmpt",
    initialState,
    reducers: {
        addXmtpClient: (state, action: PayloadAction<string>) => {
            // if (!state.clients.find(client => client.address === action.payload.address)) {
            //     state.clients.push(action.payload)
            // }
            if (!state.registerdClients.find(address => address === action.payload))
                state.registerdClients.push(action.payload)
        },

        addXmptClients: (state, action: PayloadAction<Client[]>) => {
            //TODO: remove clients already registered
            state.clients.push(...action.payload)
            state.registerdClients.push(...action.payload.map(client => client.address))
        },

        removeXmptClient: (state, action: PayloadAction<string>) => {
            const index = state.clients.findIndex(client => client.address === action.payload)
            if (index !== -1) state.clients.splice(index, 1)
        },

        clearActiveClients: state => {
            state.clients = []
        },

        changeXmtpNetwork: (state, action: PayloadAction<XmtpNetwork>) => {
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

        resetXmtpState: () => initialState,
    },
})

export const {
    addXmtpClient,
    addXmptClients,
    removeXmptClient,
    clearActiveClients,
    changeXmtpNetwork,
    resetXmtpState,
    setDbEncryptionKey,
    clearDbEncryptionKey,
} = XmtpSlice.actions
