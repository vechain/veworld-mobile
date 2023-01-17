import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "~Storage/Caches/cache"

export const initialConnectedAppsState: string[] = []

export const connectedAppSlice = createSlice({
    name: "connectedApps",
    initialState: initialConnectedAppsState,
    reducers: {
        updateConnectedApps: (_, action: PayloadAction<string[]>) => {
            return action.payload
        },
    },
})

export const { updateConnectedApps } = connectedAppSlice.actions

export const getConnectedAppUrls = (state: RootState) => state.connectedApps

export const getConnectedApp = (appUrl: string) => (state: RootState) => {
    return state.connectedApps.find(url => url === appUrl)
}
