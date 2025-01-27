import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { NotificationState } from "../Types"

export const initialNotificationState: NotificationState = {
    feautureEnabled: false,
    permissionEnabled: null,
    optedIn: null,
    dappVisitCounter: {},
    userTags: {},
}

export const Notification = createSlice({
    name: "notification",
    initialState: initialNotificationState,
    reducers: {
        updateNotificationFeatureFlag: (state, action: PayloadAction<boolean>) => {
            state.feautureEnabled = action.payload
        },
        updateNotificationPermission: (state, action: PayloadAction<boolean>) => {
            state.permissionEnabled = action.payload
        },
        updateNotificationOptedIn: (state, action: PayloadAction<boolean>) => {
            state.optedIn = action.payload
        },
        increaseDappVisitCounter: (state, action: PayloadAction<{ dappId: string }>) => {
            const id = action.payload.dappId

            if (state.dappVisitCounter[id]) {
                if (state.dappVisitCounter[id] < 2) {
                    state.dappVisitCounter[id] = state.dappVisitCounter[id] + 1
                }
            } else {
                state.dappVisitCounter[id] = 1
            }
        },
        setDappVisitCounter: (state, action: PayloadAction<{ dappId: string; counter: number }>) => {
            state.dappVisitCounter[action.payload.dappId] = action.payload.counter
        },
        removeDappVisitCounter: (state, action: PayloadAction<{ dappId: string }>) => {
            if (state.dappVisitCounter[action.payload.dappId]) {
                delete state.dappVisitCounter[action.payload.dappId]
            }
        },
    },
})

export const {
    updateNotificationFeatureFlag,
    updateNotificationPermission,
    updateNotificationOptedIn,
    increaseDappVisitCounter,
    setDappVisitCounter,
    removeDappVisitCounter,
} = Notification.actions
