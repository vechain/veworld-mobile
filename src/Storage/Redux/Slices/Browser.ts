import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DiscoveryDApp } from "~Constants"

export interface BrowserState {
    visitedUrls: DiscoveryDApp[]
}

const initialState: BrowserState = {
    visitedUrls: [],
}

export const BrowserSlice = createSlice({
    name: "browser",
    initialState,
    reducers: {
        setVisitedUrl: (state, action: PayloadAction<DiscoveryDApp>) => {
            state.visitedUrls = [...state.visitedUrls.filter(dapp => dapp.href !== action.payload.href), action.payload]
        },
        deleteVisitedUrl: (state, action: PayloadAction<string>) => {
            state.visitedUrls = state.visitedUrls.filter(dapp => dapp.href !== action.payload)
        },
        resetBrowserState: () => initialState,
    },
})

export const { setVisitedUrl, deleteVisitedUrl, resetBrowserState } = BrowserSlice.actions
