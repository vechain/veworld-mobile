import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import HexUtils from "~Utils/HexUtils"
import { NotificationState } from "../Types"

export const initialNotificationState: NotificationState = {
    feautureEnabled: false,
    permissionEnabled: null,
    optedIn: null,
    dappVisitCounter: {},
    userTags: {},
    dappNotifications: true,
    walletRegistrations: null,
    lastFullRegistration: null,
    lastSubscriptionId: null,
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
        setDappNotifications: (state, action: PayloadAction<boolean>) => {
            state.dappNotifications = action.payload
        },
        updateWalletRegistrations: (state, action: PayloadAction<{ addresses: string[]; timestamp: number }>) => {
            if (!state.walletRegistrations) {
                state.walletRegistrations = {}
            }
            action.payload.addresses.forEach(address => {
                // Normalize address for consistent storage
                const normalizedAddress = HexUtils.normalize(address)
                state.walletRegistrations![normalizedAddress] = action.payload.timestamp
            })
        },
        updateLastFullRegistration: (state, action: PayloadAction<number>) => {
            state.lastFullRegistration = action.payload
        },
        updateLastSubscriptionId: (state, action: PayloadAction<string | null>) => {
            state.lastSubscriptionId = action.payload
        },
    },
})

export const {
    updateNotificationFeatureFlag,
    updateNotificationPermission,
    updateNotificationOptedIn,
    increaseDappVisitCounter,
    setDappVisitCounter,
    setDappNotifications,
    removeDappVisitCounter,
    updateWalletRegistrations,
    updateLastFullRegistration,
    updateLastSubscriptionId,
} = Notification.actions
